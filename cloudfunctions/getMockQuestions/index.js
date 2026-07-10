var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

/**
 * 随机组卷 — 按题型比例从题库抽取
 */
exports.main = async function (event) {
  var examTypeId = event.examTypeId;
  var subjectId = event.subjectId;
  var totalCount = event.totalCount || 100;

  var typeRatios = { single: 0.4, multi: 0.2, judge: 0.2, fill: 0.1, essay: 0.1 };
  var poolRes = await db.collection('questions')
    .where({ examTypeId: examTypeId, subjectId: subjectId })
    .field({ _id: true, type: true })
    .get();
  var pool = poolRes.data;

  // 按题型分组
  var byType = { single: [], multi: [], judge: [], fill: [], essay: [] };
  for (var i = 0; i < pool.length; i++) {
    var t = pool[i].type;
    if (byType[t]) byType[t].push(pool[i]._id);
  }

  // Fisher-Yates 洗牌
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  var selectedIds = [];
  var types = Object.keys(typeRatios);
  for (var k = 0; k < types.length; k++) {
    var type = types[k];
    var count = Math.floor(totalCount * typeRatios[type]);
    var shuffled = shuffle(byType[type] || []);
    selectedIds = selectedIds.concat(shuffled.slice(0, count));
  }

  // 补充差额
  var remaining = totalCount - selectedIds.length;
  if (remaining > 0) {
    var allIds = [];
    for (var m = 0; m < pool.length; m++) {
      if (selectedIds.indexOf(pool[m]._id) === -1) allIds.push(pool[m]._id);
    }
    selectedIds = selectedIds.concat(shuffle(allIds).slice(0, remaining));
  }

  // 批量获取题目
  var questions = [];
  for (var n = 0; n < selectedIds.length; n += 100) {
    var batch = selectedIds.slice(n, n + 100);
    var res = await db.collection('questions').where({ _id: db.command.in(batch) }).get();
    questions = questions.concat(res.data);
  }

  return { questions: questions, paperId: 'mock_' + Date.now() };
};
