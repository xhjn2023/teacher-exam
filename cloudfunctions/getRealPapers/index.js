var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = function (event, context) {
  var examTypeId = event.examTypeId;
  var subjectId = event.subjectId;
  var page = event.page || 1;
  var pageSize = event.pageSize || 10;
  var skip = (page - 1) * pageSize;

  if (!examTypeId || !subjectId) {
    return { list: [], total: 0, hasMore: false };
  }

  var where = {
    examTypeId: examTypeId,
    subjectId: subjectId
  };

  var countPromise = db.collection('real_papers')
    .where(where)
    .count();

  var listPromise = db.collection('real_papers')
    .where(where)
    .orderBy('year', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get();

  return Promise.all([countPromise, listPromise]).then(function (results) {
    var total = results[0].total;
    var list = results[1].data;
    return {
      list: list,
      total: total,
      hasMore: skip + list.length < total
    };
  });
};
