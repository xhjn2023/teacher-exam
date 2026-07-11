var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function (event, context) {
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;

  if (!userId) {
    return { code: -1, msg: '获取openid失败' };
  }

  var nickName = event.nickName || '';
  var avatarUrl = event.avatarUrl || '';
  var now = new Date();

  try {
    // 查找已有用户记录
    var userRes = await db.collection('user_progress').where({ userId: userId }).get();
    var isNewUser = userRes.data.length === 0;

    if (isNewUser) {
      // 新用户，创建记录
      await db.collection('user_progress').add({
        data: {
          userId: userId,
          nickName: nickName,
          avatarUrl: avatarUrl,
          totalDays: 0,
          totalCount: 0,
          correctCount: 0,
          correctRate: 0,
          dailyStats: [],
          createTime: now,
          updateTime: now
        }
      });
    } else {
      // 老用户：若本次提交了昵称或头像，则同步更新
      var existing = userRes.data[0];
      var needUpdate = false;
      var updateData = { updateTime: now };

      if (nickName && nickName !== existing.nickName) {
        updateData.nickName = nickName;
        needUpdate = true;
      }
      if (avatarUrl && avatarUrl !== existing.avatarUrl) {
        updateData.avatarUrl = avatarUrl;
        needUpdate = true;
      }
      if (needUpdate) {
        await db.collection('user_progress').doc(existing._id).update({ data: updateData });
      }
    }

    // 重新读取最新数据并返回（确保前端拿到权威状态）
    var latestRes = await db.collection('user_progress').where({ userId: userId }).get();
    var latest = latestRes.data[0] || {};

    return {
      code: 0,
      userId: userId,
      isNewUser: isNewUser,
      userInfo: {
        nickName: latest.nickName || nickName,
        avatarUrl: latest.avatarUrl || avatarUrl
      },
      studyData: {
        totalDays: latest.totalDays || 0,
        totalCount: latest.totalCount || 0,
        correctCount: latest.correctCount || 0,
        correctRate: latest.correctRate || 0,
        points: latest.points || 0,
        streak: latest.streak || 0,
        lastCheckinDate: latest.lastCheckinDate || ''
      }
    };
  } catch (err) {
    console.error('login error:', err);
    return { code: -1, msg: '登录服务异常，请稍后重试' };
  }
};
