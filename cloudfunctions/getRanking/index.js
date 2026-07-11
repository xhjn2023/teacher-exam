var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

/**
 * 积分排行榜
 * 查询 user_progress 集合，按 points 降序返回 Top 50
 * 返回: { code: 0, list: [{ userId, nickName, avatarUrl, points, totalCount, streak, rank }] }
 */
exports.main = function (event, context) {
  return db.collection('user_progress')
    .field({
      userId: true,
      nickName: true,
      avatarUrl: true,
      points: true,
      totalCount: true,
      streak: true
    })
    .orderBy('points', 'desc')
    .orderBy('totalCount', 'desc')
    .limit(50)
    .get()
    .then(function (res) {
      var list = (res.data || []).map(function (item, index) {
        var nickName = item.nickName || '';
        if (!nickName) nickName = '匿名学员';
        return {
          userId: maskUserId(item.userId),
          nickName: nickName,
          avatarUrl: item.avatarUrl || '',
          points: item.points || 0,
          totalCount: item.totalCount || 0,
          streak: item.streak || 0,
          rank: index + 1
        };
      });
      return { code: 0, list: list };
    })
    .catch(function () {
      return { code: 0, list: [] };
    });
};

// userId 脱敏：只显示前4位 + 后4位，中间用 **** 代替
function maskUserId(userId) {
  if (!userId || typeof userId !== 'string') return '';
  if (userId.length <= 8) return userId;
  return userId.substring(0, 4) + '****' + userId.substring(userId.length - 4);
}
