var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function (event, context) {
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;

  if (!userId) {
    return { code: -1, msg: '获取openid失败' };
  }

  // 查找或创建用户记录
  var userRes = await db.collection('user_progress').where({ userId: userId }).get();

  if (userRes.data.length === 0) {
    // 新用户，创建记录
    await db.collection('user_progress').add({
      data: {
        userId: userId,
        nickName: event.nickName || '',
        avatarUrl: event.avatarUrl || '',
        totalDays: 0,
        totalCount: 0,
        correctCount: 0,
        correctRate: 0,
        dailyStats: [],
        createTime: new Date(),
        updateTime: new Date()
      }
    });
  } else if (event.nickName || event.avatarUrl) {
    // 更新用户信息
    var updateData = { updateTime: new Date() };
    if (event.nickName) updateData.nickName = event.nickName;
    if (event.avatarUrl) updateData.avatarUrl = event.avatarUrl;
    await db.collection('user_progress').doc(userRes.data[0]._id).update({ data: updateData });
  }

  return {
    code: 0,
    userId: userId,
    nickName: event.nickName || '',
    avatarUrl: event.avatarUrl || ''
  };
};
