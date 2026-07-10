var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = function (event, context) {
  var paperId = event.paperId;
  var answers = event.answers || [];
  var totalDuration = event.totalDuration || 0;
  var wxContext = cloud.getWXContext();
  var userId = wxContext.OPENID;

  if (!userId || answers.length === 0) {
    return {
      score: 0,
      correctCount: 0,
      totalCount: 0,
      correctRate: 0,
      details: []
    };
  }

  var questionIds = answers.map(function (a) {
    return a.questionId;
  });

  return db.collection('questions')
    .where({ _id: db.command.in(questionIds) })
    .get()
    .then(function (res) {
      var questionMap = {};
      res.data.forEach(function (q) {
        questionMap[q._id] = q;
      });

      var correctCount = 0;
      var details = answers.map(function (a) {
        var question = questionMap[a.questionId];
        var correctAnswer = question ? question.answer : '';
        var userAnswer = a.userAnswer || '';
        var isCorrect = userAnswer === correctAnswer;

        if (isCorrect) {
          correctCount++;
        }

        return {
          questionId: a.questionId,
          userAnswer: userAnswer,
          correctAnswer: correctAnswer,
          isCorrect: isCorrect
        };
      });

      var totalCount = answers.length;
      var score = correctCount;
      var correctRate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) / 100 : 0;

      // 更新错题本
      var errorBookPromises = details.filter(function (d) {
        return !d.isCorrect;
      }).map(function (d) {
        // 查找题目对应的科目
        var question = questionMap[d.questionId];
        var subjectId = question ? question.subjectId : '';

        return db.collection('user_error_book')
          .where({
            userId: userId,
            questionId: d.questionId,
            subjectId: subjectId
          })
          .get()
          .then(function (errRes) {
            if (errRes.data.length > 0) {
              // 已存在，增加错误次数并更新时间
              var record = errRes.data[0];
              return db.collection('user_error_book')
                .doc(record._id)
                .update({
                  data: {
                    wrongCount: db.command.inc(1),
                    lastWrongTime: new Date(),
                    userAnswer: d.userAnswer,
                    isRemoved: false
                  }
                });
            } else {
              // 新增
              return db.collection('user_error_book')
                .add({
                  data: {
                    userId: userId,
                    questionId: d.questionId,
                    subjectId: subjectId,
                    wrongCount: 1,
                    userAnswer: d.userAnswer,
                    lastWrongTime: new Date(),
                    isRemoved: false
                  }
                });
            }
          });
      });

      // 移除做对的题目
      var rightPromises = details.filter(function (d) {
        return d.isCorrect;
      }).map(function (d) {
        var question = questionMap[d.questionId];
        var subjectId = question ? question.subjectId : '';

        return db.collection('user_error_book')
          .where({
            userId: userId,
            questionId: d.questionId,
            subjectId: subjectId
          })
          .get()
          .then(function (errRes) {
            if (errRes.data.length > 0) {
              return db.collection('user_error_book')
                .doc(errRes.data[0]._id)
                .update({
                  data: { isRemoved: true }
                });
            }
            return Promise.resolve();
          });
      });

      // 更新用户进度统计
      var updateProgressPromise = db.collection('user_progress')
        .where({ userId: userId })
        .get()
        .then(function (progRes) {
          var today = new Date();
          var todayStr = today.getFullYear() + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            String(today.getDate()).padStart(2, '0');

          if (progRes.data.length > 0) {
            var progress = progRes.data[0];
            var dailyStats = progress.dailyStats || [];
            var todayStats = dailyStats.find(function (ds) {
              return ds.date === todayStr;
            });

            if (todayStats) {
              todayStats.totalCount = (todayStats.totalCount || 0) + totalCount;
              todayStats.correctCount = (todayStats.correctCount || 0) + correctCount;
            } else {
              dailyStats.push({
                date: todayStr,
                totalCount: totalCount,
                correctCount: correctCount
              });
            }

            var newTotalCount = (progress.totalCount || 0) + totalCount;
            var newCorrectCount = (progress.correctCount || 0) + correctCount;
            var newCorrectRate = newTotalCount > 0
              ? Math.round((newCorrectCount / newTotalCount) * 10000) / 10000
              : 0;

            return db.collection('user_progress')
              .doc(progress._id)
              .update({
                data: {
                  totalDays: dailyStats.length,
                  totalCount: newTotalCount,
                  correctCount: newCorrectCount,
                  correctRate: newCorrectRate,
                  dailyStats: dailyStats,
                  updateTime: new Date()
                }
              });
          } else {
            return db.collection('user_progress')
              .add({
                data: {
                  userId: userId,
                  totalDays: 1,
                  totalCount: totalCount,
                  correctCount: correctCount,
                  correctRate: correctRate,
                  dailyStats: [{
                    date: todayStr,
                    totalCount: totalCount,
                    correctCount: correctCount
                  }],
                  updateTime: new Date()
                }
              });
          }
        });

      return Promise.all(errorBookPromises.concat(rightPromises).concat([updateProgressPromise]))
        .then(function () {
          return {
            score: score,
            correctCount: correctCount,
            totalCount: totalCount,
            correctRate: correctRate,
            details: details
          };
        });
    });
};
