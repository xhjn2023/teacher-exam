var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = function (event, context) {
  var subjectId = event.subjectId;
  var page = event.page || 1;
  var pageSize = event.pageSize || 10;
  var skip = (page - 1) * pageSize;
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;

  if (!subjectId || !userId) {
    return { list: [], total: 0, hasMore: false };
  }

  var where = {
    userId: userId,
    subjectId: subjectId,
    isRemoved: false
  };

  var countPromise = db.collection('user_error_book')
    .where(where)
    .count();

  var listPromise = db.collection('user_error_book')
    .where(where)
    .orderBy('lastWrongTime', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get();

  return Promise.all([countPromise, listPromise]).then(function (results) {
    var total = results[0].total;
    var errorBookRecords = results[1].data;

    if (errorBookRecords.length === 0) {
      return { list: [], total: total, hasMore: false };
    }

    var questionIds = errorBookRecords.map(function (record) {
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

        var list = errorBookRecords.map(function (record) {
          return {
            question: questionMap[record.questionId] || null,
            wrongCount: record.wrongCount,
            lastWrongTime: record.lastWrongTime
          };
        }).filter(function (item) {
          return item.question !== null;
        });

        return {
          list: list,
          total: total,
          hasMore: skip + errorBookRecords.length < total
        };
      });
  });
};
