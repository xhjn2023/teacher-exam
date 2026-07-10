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
    hasAnswered: false
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
        wx.showToast({ title: '已掌握 ✓', icon: 'success', duration: 1000 });
      }
    },

    onToggleFav: function () {
      this.triggerEvent('toggleFav', { questionId: this.data.question._id });
    },

    /** 外部触发显示解析 */
    showAnalysisNow: function () {
      this.setData({ showAnalysis: true, isCorrect: String(this.data.userAnswer) === String(this.data.question.answer), hasAnswered: true });
    }
  }
});
