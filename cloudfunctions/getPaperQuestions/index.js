var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function (event) {
  var paperId = event.paperId;
  var paperRes = await db.collection('real_papers').doc(paperId).get();
  var paper = paperRes.data;
  if (!paper || !paper.questionIds || !paper.questionIds.length) {
    return { paper: paper, questions: [] };
  }
  var questionIds = paper.questionIds;
  var questions = [];
  for (var i = 0; i < questionIds.length; i += 100) {
    var batch = questionIds.slice(i, i + 100);
    var res = await db.collection('questions').where({ _id: db.command.in(batch) }).get();
    questions = questions.concat(res.data);
  }
  // 按原顺序排列
  var idMap = {};
  for (var j = 0; j < questions.length; j++) { idMap[questions[j]._id] = questions[j]; }
  var ordered = [];
  for (var k = 0; k < questionIds.length; k++) {
    if (idMap[questionIds[k]]) ordered.push(idMap[questionIds[k]]);
  }
  return { paper: paper, questions: ordered };
};
