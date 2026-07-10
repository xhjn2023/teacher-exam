var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = function (event, context) {
  var subjectId = event.subjectId;
  var page = event.page || 1;
  var pageSize = event.pageSize || 10;
  var skip = (page - 1) * pageSize;

  if (!subjectId) {
    return { list: [], total: 0, hasMore: false };
  }

  var where = {
    subjectId: subjectId,
    type: db.command.in(['essay', 'explain'])
  };

  var countPromise = db.collection('questions')
    .where(where)
    .count();

  var listPromise = db.collection('questions')
    .where(where)
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
