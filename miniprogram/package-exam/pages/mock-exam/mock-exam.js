var request = require('../../../utils/request');
var timerUtil = require('../../../utils/timer');

Page({
  data: {
    examTypeId: '',
    subjectId: '',
    totalCount: 0,
    questions: [],
    answers: {},
    current: 0,
    totalDuration: 0,
    showSheet: false,
    remainingSeconds: 0,
    answeredCount: 0,
    unansweredCount: 0,
    sheetAnswers: [],
    loading: true,
    showConfirmModal: false,
    submitted: false
  },

  onLoad: function (options) {
    var self = this;
    var examTypeId = options.examTypeId || '';
    var subjectId = options.subjectId || '';
    var totalCount = parseInt(options.totalCount) || 100;

    wx.setNavigationBarTitle({ title: '模拟考场' });

    this.setData({
      examTypeId: examTypeId,
      subjectId: subjectId,
      totalCount: totalCount
    });

    this._loadQuestions(examTypeId, subjectId, totalCount);
  },

  onUnload: function () {
    if (this._countdown) this._countdown.stop();
    if (this.data.submitted) return;
    this._saveProgress();
  },

  /**
   * 显示/隐藏答题卡
   */
  toggleSheet: function () {
    this.setData({ showSheet: !this.data.showSheet });
  },

  /**
   * 从答题卡跳转到指定题
   */
  onJump: function (e) {
    var index = e.detail.index;
    this.setData({
      current: index,
      showSheet: false
    });
  },

  /**
   * 选择答案
   */
  onAnswer: function (e) {
    var questionId = e.detail.questionId;
    var answer = e.detail.answer;
    var answers = this.data.answers;
    answers[questionId] = answer;

    this.setData({ answers: answers });
    this._updateStats();
  },

  /**
   * 单题提交（exam 模式下不需要）
   */
  onSubmitSingle: function () {},

  /**
   * 上一题
   */
  prevQ: function () {
    if (this.data.current <= 0) return;
    this.setData({ current: this.data.current - 1 });
  },

  /**
   * 下一题
   */
  nextQ: function () {
    if (this.data.current >= this.data.questions.length - 1) return;
    this.setData({ current: this.data.current + 1 });
  },

  /**
   * 打开交卷确认弹窗
   */
  onConfirmSubmit: function () {
    this._updateStats();
    this.setData({ showConfirmModal: true, showSheet: false });
  },

  /**
   * 关闭确认弹窗
   */
  hideConfirm: function () {
    this.setData({ showConfirmModal: false });
  },

  /**
   * 确认交卷
   */
  doSubmit: function () {
    var self = this;
    if (this.data.submitted) return;

    this.setData({ submitted: true });

    if (this._countdown) this._countdown.stop();

    var answers = this.data.answers;
    var questions = this.data.questions;

    // 计算成绩
    var correctCount = 0;
    var wrongCount = 0;
    var unansweredCount = 0;
    var scoreList = [];

    questions.forEach(function (q) {
      var userAnswer = answers[q._id] || '';
      var isCorrect = false;

      if (!userAnswer) {
        unansweredCount++;
      } else if (String(userAnswer) === String(q.answer)) {
        correctCount++;
        isCorrect = true;
      } else {
        wrongCount++;
      }

      scoreList.push({
        questionId: q._id,
        userAnswer: userAnswer,
        isCorrect: isCorrect
      });
    });

    var duration = this.data.totalDuration * 60 - this.data.remainingSeconds;
    var durationMinutes = Math.floor(duration / 60);

    // 提交成绩
    request.callFunction('submitExamResult', {
      examTypeId: this.data.examTypeId,
      subjectId: this.data.subjectId,
      answers: scoreList,
      correctCount: correctCount,
      wrongCount: wrongCount,
      unansweredCount: unansweredCount,
      score: correctCount,
      totalScore: questions.length,
      duration: duration,
      examType: 'mock'
    }).catch(function () {});

    // 跳转到成绩页
    wx.redirectTo({
      url: '/package-exam/pages/mock-exam-result/mock-exam-result' +
        '?correctCount=' + correctCount +
        '&wrongCount=' + wrongCount +
        '&unansweredCount=' + unansweredCount +
        '&totalQuestions=' + questions.length +
        '&duration=' + durationMinutes +
        '&durationSeconds=' + duration +
        '&examTypeId=' + this.data.examTypeId +
        '&examType=mock'
    });
  },

  /**
   * 时间格式化
   */
  formatDuration: function (minutes) {
    if (!minutes) return '120分钟';
    return minutes + '分钟';
  },

  /**
   * 返回
   */
  goBack: function () {
    wx.navigateBack();
  },

  /* ========== 内部方法 ========== */

  _loadQuestions: function (examTypeId, subjectId, totalCount) {
    var self = this;

    request.showLoading('加载题目中...');

    request.callFunction('getMockQuestions', {
      examTypeId: examTypeId,
      subjectId: subjectId,
      count: totalCount
    }, { forceRefresh: true })
      .then(function (result) {
        request.hideLoading();

        var questions = (result && result.questions) || [];
        // 总时长默认 120 分钟（可从云函数返回覆盖）
        var totalDuration = (result && result.duration) || 120;

        // 初始化答案结构
        var answers = {};
        var sheetAnswers = [];
        questions.forEach(function () {
          sheetAnswers.push('');
        });

        self.setData({
          questions: questions,
          totalDuration: totalDuration,
          remainingSeconds: totalDuration * 60,
          sheetAnswers: sheetAnswers,
          answers: answers,
          loading: false,
          current: 0
        });

        if (questions.length === 0) {
          wx.showToast({ title: '暂无题目', icon: 'none' });
          return;
        }

        // 启动倒计时
        self._startCountdown(totalDuration * 60);
      })
      .catch(function () {
        request.hideLoading();
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
        self.setData({ loading: false });
      });
  },

  _startCountdown: function (totalSeconds) {
    var self = this;
    this._countdown = timerUtil.createCountdown(
      totalSeconds,
      function (remaining) {
        self.setData({ remainingSeconds: Math.max(0, remaining) });
        self._updateStats();
      },
      function () {
        // 超时自动交卷
        wx.showToast({ title: '考试时间到，自动交卷', icon: 'none', duration: 2000 });
        setTimeout(function () {
          self.doSubmit();
        }, 1500);
      }
    );
    this._countdown.start();
  },

  _updateStats: function () {
    var answers = this.data.answers;
    var questions = this.data.questions;
    var answeredCount = 0;
    var sheetAnswers = [];

    questions.forEach(function (q) {
      var ua = answers[q._id];
      if (ua && typeof ua === 'string' && ua.trim() !== '') {
        sheetAnswers.push('answered');
        answeredCount++;
      } else if (ua && typeof ua !== 'string') {
        sheetAnswers.push('answered');
        answeredCount++;
      } else {
        sheetAnswers.push('');
      }
    });

    this.setData({
      answeredCount: answeredCount,
      unansweredCount: questions.length - answeredCount,
      sheetAnswers: sheetAnswers
    });
  },

  _saveProgress: function () {
    request.callFunction('saveExamProgress', {
      examTypeId: this.data.examTypeId,
      subjectId: this.data.subjectId,
      answers: this.data.answers,
      current: this.data.current,
      remainingSeconds: this.data.remainingSeconds,
      examType: 'mock'
    }).catch(function () {});
  }
});
