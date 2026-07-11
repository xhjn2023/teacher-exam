var request = require('../../../utils/request');
var timerUtil = require('../../../utils/timer');
var config = require('../../../utils/config');

Page({
  data: {
    paperId: '',
    paper: {},
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
    var paperId = options.paperId || '';

    wx.setNavigationBarTitle({ title: '真题套卷' });

    this.setData({ paperId: paperId });

    this._loadPaper(paperId);
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
   * 单题提交（无实际作用，exam 模式下不需要）
   */
  onSubmitSingle: function () {
    // exam 模式下不需要单题提交
  },

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
    var scoreList = [];

    questions.forEach(function (q) {
      var userAnswer = answers[q._id] || '';
      var isCorrect = String(userAnswer) === String(q.answer);
      if (isCorrect) correctCount++;
      scoreList.push({
        questionId: q._id,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        type: q.type
      });
    });

    var totalQuestions = questions.length;
    var score = correctCount;
    var totalScore = questions.length;

    // 提交成绩
    request.callFunction('submitExamResult', {
      paperId: this.data.paperId,
      answers: scoreList,
      correctCount: correctCount,
      wrongCount: totalQuestions - correctCount,
      score: score,
      totalScore: totalScore,
      duration: this.data.totalDuration * 60 - this.data.remainingSeconds,
      examType: 'real'
    }).catch(function () {});

    // 跳转到成绩页
    wx.redirectTo({
      url: '/package-exam/pages/mock-exam-result/mock-exam-result?correctCount=' + correctCount +
        '&totalQuestions=' + totalQuestions +
        '&duration=' + Math.max(0, this.data.totalDuration * 60 - this.data.remainingSeconds) +
        '&paperId=' + this.data.paperId +
        '&examType=real'
    });
  },

  /**
   * 返回
   */
  goBack: function () {
    wx.navigateBack();
  },

  /* ========== 内部方法 ========== */

  _loadPaper: function (paperId) {
    var self = this;

    request.callFunction('getPaperQuestions', {
      paperId: paperId
    })
      .then(function (result) {
        var paper = (result && result.paper) || {};
        var questions = (result && result.questions) || [];
        var totalDuration = paper.duration || 120;

        // 初始化答案结构
        var answers = {};
        var sheetAnswers = [];

        questions.forEach(function () {
          sheetAnswers.push('');
        });

        self.setData({
          paper: paper,
          questions: questions,
          totalDuration: totalDuration,
          remainingSeconds: totalDuration * 60,
          sheetAnswers: sheetAnswers,
          answers: answers,
          loading: false,
          current: 0
        });

        // 设置导航标题
        if (paper.title) {
          wx.setNavigationBarTitle({ title: paper.title });
        }

        // 启动倒计时
        self._startCountdown(totalDuration * 60);
      })
      .catch(function () {
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
        self.doSubmit();
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
      if (ua && ua.trim) {
        // 有答案
        sheetAnswers.push('answered');
        answeredCount++;
      } else if (ua) {
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
      paperId: this.data.paperId,
      answers: this.data.answers,
      current: this.data.current,
      remainingSeconds: this.data.remainingSeconds,
      examType: 'real'
    }).catch(function () {});
  }
});
