var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function (event) {
  var subjectId = event.subjectId;
  var chapterId = event.chapterId;
  var type = event.type || '';
  var page = event.page || 1;
  var pageSize = event.pageSize || 20;
  var random = event.random || false; // 随机练习模式

  var where = {};
  if (subjectId) where.subjectId = subjectId;
  if (chapterId) where.chapterId = chapterId;
  if (type) where.type = type;

  var countRes = await db.collection('questions').where(where).count();
  var total = countRes.total;

  // 随机练习：取全部题目打乱后取对应页
  if (random) {
    var allRes = await db.collection('questions').where(where).limit(100).get();
    var shuffled = shuffle(allRes.data);
    var start = (page - 1) * pageSize;
    var pageData = shuffled.slice(start, start + pageSize);
    return {
      list: pageData,
      total: shuffled.length,
      hasMore: start + pageSize < shuffled.length,
      page: page,
      pageSize: pageSize
    };
  }

  var res = await db.collection('questions')
    .where(where)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();

  return {
    list: res.data,
    total: total,
    hasMore: page * pageSize < total,
    page: page,
    pageSize: pageSize
  };
};

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}
