var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();
var _ = db.command;

// 积分规则
var POINTS_DAILY = 5;        // 每日签到基础积分
var POINTS_STREAK_7 = 10;    // 连续7天额外奖励
var POINTS_STREAK_30 = 50;   // 连续30天额外奖励

function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function yesterdayStr() {
  var d = new Date();
  d.setDate(d.getDate() - 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/**
 * 签到云函数
 * event.action: 'checkin'(签到) | 'status'(查询状态),默认 status
 */
exports.main = async function (event, context) {
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;
  if (!userId) return { code: -1, msg: '未登录' };

  var action = event.action || 'status';
  var today = todayStr();

  try {
    // 获取用户进度记录
    var progressRes = await db.collection('user_progress').where({ userId: userId }).get();
    var progress = progressRes.data[0];

    // 兜底:无记录则创建
    if (!progress) {
      await db.collection('user_progress').add({
        data: {
          userId: userId,
          nickName: '', avatarUrl: '',
          totalDays: 0, totalCount: 0, correctCount: 0, correctRate: 0,
          points: 0, streak: 0, lastCheckinDate: '',
          dailyStats: [],
          createTime: new Date(), updateTime: new Date()
        }
      });
      progressRes = await db.collection('user_progress').where({ userId: userId }).get();
      progress = progressRes.data[0];
    }

    var lastCheckin = progress.lastCheckinDate || '';
    var streak = progress.streak || 0;
    var points = progress.points || 0;

    // 查询今日是否已签到
    var todayCheckin = await db.collection('user_checkin')
      .where({ userId: userId, date: today })
      .get();

    // ===== 查询状态 =====
    if (action === 'status') {
      // 查最近7天签到记录(用于日历展示)
      var recent = await db.collection('user_checkin')
        .where({ userId: userId })
        .orderBy('date', 'desc')
        .limit(30)
        .get();

      return {
        code: 0,
        todayChecked: todayCheckin.data.length > 0,
        streak: streak,
        points: points,
        recentDates: recent.data.map(function (r) { return r.date; }),
        rules: {
          daily: POINTS_DAILY,
          streak7: POINTS_STREAK_7,
          streak30: POINTS_STREAK_30
        }
      };
    }

    // ===== 执行签到 =====
    if (action === 'checkin') {
      if (todayCheckin.data.length > 0) {
        return { code: -1, msg: '今日已签到' };
      }

      // 计算连续天数
      var newStreak;
      if (lastCheckin === yesterdayStr()) {
        newStreak = streak + 1; // 连续
      } else if (lastCheckin === today) {
        newStreak = streak; // 不应到达(已签到会拦截),兜底
      } else {
        newStreak = 1; // 断签重新计数
      }

      // 计算获得积分
      var gained = POINTS_DAILY;
      if (newStreak % 30 === 0) gained += POINTS_STREAK_30;
      else if (newStreak % 7 === 0) gained += POINTS_STREAK_7;

      // 写入签到记录
      await db.collection('user_checkin').add({
        data: {
          userId: userId,
          date: today,
          streak: newStreak,
          pointsGained: gained,
          createTime: new Date()
        }
      });

      // 更新用户进度
      await db.collection('user_progress').doc(progress._id).update({
        data: {
          points: _.inc(gained),
          streak: newStreak,
          lastCheckinDate: today,
          updateTime: new Date()
        }
      });

      return {
        code: 0,
        msg: '签到成功',
        gained: gained,
        streak: newStreak,
        points: points + gained,
        todayChecked: true
      };
    }

    return { code: -1, msg: '未知操作' };
  } catch (err) {
    console.error('checkin error:', err);
    return { code: -1, msg: '签到服务异常' };
  }
};
