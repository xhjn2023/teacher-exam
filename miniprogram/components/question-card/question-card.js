var audio = require('../../utils/audio');

Component({
  properties: {
    question: { type: Object, value: {} },
    index: { type: Number, value: 0 },
    userAnswer: { type: String, value: '' },
    showAnalysis: { type: Boolean, value: false },
    isFavorited: { type: Boolean, value: false },
    mode: { type: String, value: 'practice' }
  },

  data: {
    typeLabel: '',
    isCorrect: false,
    hasAnswered: false,
    showReportPopup: false,
    reportType: '',
    reportContent: '',
    reportSubmitting: false,
    reportTypes: [
      { value: 'wrong_answer', label: '答案错误' },
      { value: 'typo', label: '题目有误' },
      { value: 'analysis', label: '解析有误' },
      { value: 'other', label: '其他' }
    ]
  },

  observers: {
    'question.type': function (type) {
      var labels = { single: '单选', multi: '多选', judge: '判断', fill: '填空', essay: '简答', explain: '论述' };
      this.setData({ typeLabel: labels[type] || type });
    },
    'userAnswer, question.answer, showAnalysis': function (ua, ans, show) {
      if (show && ua && ans) {
        this.setData({ isCorrect: String(ua) === String(ans), hasAnswered: true });
      }
    }
  },

  methods: {
    onSelect: function (e) {
      if (this.data.showAnalysis) return;
      var key = e.currentTarget.dataset.key;
      this.setData({ userAnswer: key });
      this.triggerEvent('answer', { answer: key, questionId: this.data.question._id });
    },

    onJudgeSelect: function (e) {
      if (this.data.showAnalysis) return;
      var key = e.currentTarget.dataset.key;
      this.setData({ userAnswer: key });
      this.triggerEvent('answer', { answer: key, questionId: this.data.question._id });
    },

    onFillInput: function (e) {
      this.setData({ userAnswer: e.detail.value });
    },

    onEssayInput: function (e) {
      this.setData({ userAnswer: e.detail.value });
    },

    onSubmit: function () {
      if (!this.data.userAnswer || !this.data.userAnswer.trim()) {
        wx.showToast({ title: '再想想，选个答案？', icon: 'none', duration: 1500 });
        return;
      }
      this.triggerEvent('submit');

      var isCorrect = String(this.data.userAnswer) === String(this.data.question.answer);
      if (isCorrect) {
        audio.playCorrect();
        wx.showToast({ title: '已掌握 ✓', icon: 'success', duration: 1000 });
      } else {
        audio.playWrong();
      }
    },

    onToggleFav: function () {
      this.triggerEvent('toggleFav', { questionId: this.data.question._id });
    },

    /** 外部触发显示解析 */
    showAnalysisNow: function () {
      this.setData({ showAnalysis: true, isCorrect: String(this.data.userAnswer) === String(this.data.question.answer), hasAnswered: true });
    },

    /** 打开报错弹窗 */
    onReport: function () {
      this.setData({ showReportPopup: true, reportType: '', reportContent: '' });
    },

    /** 关闭报错弹窗 */
    onReportClose: function () {
      if (this.data.reportSubmitting) return;
      this.setData({ showReportPopup: false });
    },

    /** 阻止冒泡 */
    onReportStop: function () {},

    /** 选择报错类型 */
    onReportTypeSelect: function (e) {
      this.setData({ reportType: e.currentTarget.dataset.value });
    },

    /** 输入报错描述 */
    onReportContentInput: function (e) {
      this.setData({ reportContent: e.detail.value });
    },

    /** 提交报错 */
    onReportSubmit: function () {
      if (this.data.reportSubmitting) return;
      if (!this.data.reportType) {
        wx.showToast({ title: '请选择报错类型', icon: 'none', duration: 1500 });
        return;
      }
      var content = (this.data.reportContent || '').trim();
      if (!content) {
        wx.showToast({ title: '请填写问题描述', icon: 'none', duration: 1500 });
        return;
      }

      var that = this;
      that.setData({ reportSubmitting: true });
      wx.showLoading({ title: '提交中', mask: true });

      wx.cloud.callFunction({
        name: 'reportQuestion',
        data: {
          questionId: that.data.question._id,
          subjectId: that.data.question.subjectId || '',
          type: that.data.reportType,
          content: content
        },
        success: function (res) {
          wx.hideLoading();
          var result = res.result || {};
          if (result.code === 0) {
            that.setData({ showReportPopup: false, reportType: '', reportContent: '' });
            wx.showToast({ title: '感谢反馈,我们会尽快核实', icon: 'none', duration: 2000 });
          } else {
            wx.showToast({ title: result.msg || '提交失败', icon: 'none', duration: 1500 });
          }
        },
        fail: function () {
          wx.hideLoading();
          wx.showToast({ title: '网络异常,稍后重试', icon: 'none', duration: 1500 });
        },
        complete: function () {
          that.setData({ reportSubmitting: false });
        }
      });
    }
  }
});
