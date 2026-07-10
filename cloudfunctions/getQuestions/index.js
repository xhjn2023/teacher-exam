var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function (event) {
  var subjectId = event.subjectId;
  var chapterId = event.chapterId;
  var type = event.type || '';
  var page = event.page || 1;
  var pageSize = event.pageSize || 20;

  var where = { subjectId: subjectId, chapterId: chapterId };
  if (type) where.type = type;

  var countRes = await db.collection('questions').where(where).count();
  var total = countRes.total;

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
