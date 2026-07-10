var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = function (event, context) {
  var page = event.page || 1;
  var pageSize = event.pageSize || 10;
  var skip = (page - 1) * pageSize;
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;

  if (!userId) {
    return { list: [], total: 0, hasMore: false };
  }

  var where = { userId: userId };

  var countPromise = db.collection('user_favorites')
    .where(where)
    .count();

  var listPromise = db.collection('user_favorites')
    .where(where)
    .orderBy('createTime', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get();

  return Promise.all([countPromise, listPromise]).then(function (results) {
    var total = results[0].total;
    var favoriteRecords = results[1].data;

    if (favoriteRecords.length === 0) {
      return { list: [], total: total, hasMore: false };
    }

    var questionIds = favoriteRecords.map(function (record) {
      return record.questionId;
    });

    return db.collection('questions')
      .where({
        _id: db.command.in(questionIds)
      })
      .get()
      .then(function (questionRes) {
        var questionMap = {};
        questionRes.data.forEach(function (q) {
          questionMap[q._id] = q;
        });

        var list = favoriteRecords.map(function (record) {
          return questionMap[record.questionId] || null;
        }).filter(function (item) {
          return item !== null;
        });

        return {
          list: list,
          total: total,
          hasMore: skip + favoriteRecords.length < total
        };
      });
  });
};
