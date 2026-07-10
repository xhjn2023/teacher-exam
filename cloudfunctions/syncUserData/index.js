var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();
var _ = db.command;

/**
 * 同步用户答题记录 + 自动更新错题本 + 学习统计
 */
exports.main = async function (event, context) {
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;
  var answers = event.answers || [];
  var today = new Date().toISOString().slice(0, 10);

  if (!answers.length) return { synced: 0 };

  // 批量写入答题记录
  for (var i = 0; i < answers.length; i++) {
    var a = answers[i];
    try {
      await db.collection('user_answers').add({
        data: {
          userId: userId,
          questionId: a.questionId,
          userAnswer: a.userAnswer || '',
          isCorrect: Boolean(a.isCorrect),
          mode: a.mode || 'chapter',
          examId: a.examId || '',
          duration: a.duration || 0,
          createTime: new Date()
        }
      });
    } catch (e) { /* 单条失败不阻断 */ }
  }

  // 错题本自动收录（错误题目）
  var wrongOnes = answers.filter(function (a) { return !a.isCorrect; });
  for (var j = 0; j < wrongOnes.length; j++) {
    var q = wrongOnes[j];
    var existing = await db.collection('user_error_book')
      .where({ userId: userId, questionId: q.questionId }).get();
    if (existing.data.length > 0) {
      await db.collection('user_error_book').doc(existing.data[0]._id).update({
        data: { wrongCount: _.inc(1), lastWrongTime: new Date(), isRemoved: false }
      });
    } else {
      await db.collection('user_error_book').add({
        data: {
          userId: userId, questionId: q.questionId,
          subjectId: q.subjectId || '', wrongCount: 1,
          lastWrongTime: new Date(), isRemoved: false, createTime: new Date()
        }
      });
    }
  }

  // 更新学习统计
  var correctCount = answers.filter(function (a) { return a.isCorrect; }).length;
  var progressRes = await db.collection('user_progress').doc(userId).get();
  var progress = progressRes.data;

  if (!progress) {
    await db.collection('user_progress').add({
      data: {
        _id: userId,
        totalDays: 1,
        totalCount: answers.length,
        correctCount: correctCount,
        dailyStats: [{ date: today, count: answers.length, correct: correctCount }],
        updateTime: new Date()
      }
    });
  } else {
    var dailyStats = progress.dailyStats || [];
    var todayIdx = -1;
    for (var d = 0; d < dailyStats.length; d++) {
      if (dailyStats[d].date === today) { todayIdx = d; break; }
    }
    if (todayIdx >= 0) {
      dailyStats[todayIdx].count += answers.length;
      dailyStats[todayIdx].correct += correctCount;
    } else {
      dailyStats.push({ date: today, count: answers.length, correct: correctCount });
      if (dailyStats.length > 30) dailyStats = dailyStats.slice(-30);
    }
    var todayDate = new Date(today);
    var lastDate = progress.updateTime ? new Date(progress.updateTime) : new Date(0);
    var isNewDay = todayDate.toDateString() !== lastDate.toDateString();

    await db.collection('user_progress').doc(userId).update({
      data: {
        totalDays: _.inc(isNewDay ? 1 : 0),
        totalCount: _.inc(answers.length),
        correctCount: _.inc(correctCount),
        dailyStats: dailyStats,
        updateTime: new Date()
      }
    });
  }

  return { synced: answers.length };
};
