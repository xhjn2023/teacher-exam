var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = function (event, context) {
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;

  if (!userId) {
    return {
      totalDays: 0,
      totalCount: 0,
      correctRate: 0
    };
  }

  return db.collection('user_progress')
    .where({ userId: userId })
    .get()
    .then(function (res) {
      if (res.data.length === 0) {
        return {
          totalDays: 0,
          totalCount: 0,
          correctRate: 0
        };
      }

      var progress = res.data[0];
      return {
        totalDays: progress.totalDays || 0,
        totalCount: progress.totalCount || 0,
        correctRate: progress.correctRate || 0
      };
    });
};
