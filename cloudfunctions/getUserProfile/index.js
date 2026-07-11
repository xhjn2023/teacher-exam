var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

/**
 * 获取用户资料 + 学习统计摘要
 * 返回完整字段，便于前端冷启动后从云端恢复登录态
 */
exports.main = function (event, context) {
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;

  var empty = {
    userId: userId,
    nickName: '',
    avatarUrl: '',
    totalDays: 0,
    totalCount: 0,
    correctCount: 0,
    correctRate: 0
  };

  if (!userId) return empty;

  return db.collection('user_progress')
    .where({ userId: userId })
    .get()
    .then(function (res) {
      if (res.data.length === 0) return empty;

      var p = res.data[0];
      return {
        userId: userId,
        nickName: p.nickName || '',
        avatarUrl: p.avatarUrl || '',
        totalDays: p.totalDays || 0,
        totalCount: p.totalCount || 0,
        correctCount: p.correctCount || 0,
        correctRate: p.correctRate || 0
      };
    })
    .catch(function () { return empty; });
};
