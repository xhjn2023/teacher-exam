var VirtualScroll = require('../../../utils/virtual-scroll');
var request = require('../../../utils/request');
var timerUtil = require('../../../utils/timer');
var config = require('../../../utils/config');

Page({
  data: {
    subjectId: '',
    chapterId: '',
    chapterTitle: '',
    current: 0,
    total: 0,
    typeLabel: '',

    // 虚拟滚动
    startIndex: 0,
    totalHeight: 0,
    offsetY: 0,
    visibleQuestions: [],

    // 答题状态
    answers: {},
    analysisMap: {},
    favMap: {},
    elapsedMap: {},

    // 分页
    page: 1,
    pageSize: 20,
    loading: true,
    loadingMore: false,
    noMore: false
  },

  onLoad: function (options) {
    var self = this;
    var subjectId = options.subjectId || '';
    var chapterId = options.chapterId || '';
    var chapterTitle = decodeURIComponent(options.chapterTitle || '章节练习');

    wx.setNavigationBarTitle({ title: chapterTitle });

    this.setData({
      subjectId: subjectId,
      chapterId: chapterId,
      chapterTitle: chapterTitle
    });

    // 初始化虚拟滚动
    this._vs = new VirtualScroll({
      itemMinHeight: 400,
      onDataChange: function (state) {
        self.setData(state);
      }
    });

    // 初始化计时器
    this._elapsedTimer = timerUtil.createElapsedTimer(function (elapsed) {
      var map = self.data.elapsedMap;
      var qid = self._getCurrentQuestionId();
      if (qid) {
        map[qid] = elapsed;
        self.setData({ elapsedMap: map });
      }
    });

    // 加载第一页
    this._loadQuestions(1);
  },

  onReady: function () {
    if (this._vs) this._vs.ready();
  },

  onUnload: function () {
    if (this._elapsedTimer) this._elapsedTimer.stop();
    if (this._vs) this._vs.destroy();
    this._syncUserData();
  },

  onReachBottom: function () {
    if (this.data.loadingMore || this.data.noMore) return;
    var nextPage = this.data.page + 1;
    this._loadQuestions(nextPage);
  },

  /**
   * 滚动事件
   */
  onScroll: function (e) {
    if (this._vs) this._vs.onScroll(e);
  },

  /**
   * 选择答案
   */
  onAnswer: function (e) {
    var answer = e.detail.answer;
    var questionId = e.detail.questionId;
    var answers = this.data.answers;
    answers[questionId] = answer;

    var analysisMap = this.data.analysisMap;
    analysisMap[questionId] = true;

    this.setData({
      answers: answers,
      analysisMap: analysisMap
    });
  },

  /**
   * 提交答案（已答题后再次点击）
   */
  onSubmit: function (e) {
    // question-card 内部已处理 Toast，此处仅记录
  },

  /**
   * 切换收藏
   */
  onToggleFav: function (e) {
    var questionId = e.detail.questionId;
    var favMap = this.data.favMap;
    var isFav = !favMap[questionId];
    favMap[questionId] = isFav;

    this.setData({ favMap: favMap });

    var self = this;
    request.callFunction('toggleFavorite', {
      questionId: questionId,
      isFavorited: isFav,
      subjectId: this.data.subjectId
    }).catch(function () {
      // 回滚
      favMap[questionId] = !isFav;
      self.setData({ favMap: favMap });
      request.showToast('操作失败，请重试');
    });
  },

  /**
   * 上一题
   */
  prevQ: function () {
    if (this.data.current <= 1) return;
    this._goToQuestion(this.data.current - 1);
  },

  /**
   * 下一题
   */
  nextQ: function () {
    if (this.data.current >= this.data.total) return;
    this._goToQuestion(this.data.current + 1);

    // 接近末尾时预加载
    if (this.data.current >= this.data.total - 5 && !this.data.noMore) {
      this._loadQuestions(this.data.page + 1);
    }
  },

  /**
   * 返回上一页
   */
  goBack: function () {
    wx.navigateBack();
  },

  /* ========== 内部方法 ========== */

  _loadQuestions: function (page) {
    var self = this;
    var isFirst = page === 1;

    if (isFirst) {
      this.setData({ loading: true });
    } else {
      this.setData({ loadingMore: true });
    }

    request.callFunction('getQuestions', {
      subjectId: this.data.subjectId,
      chapterId: this.data.chapterId,
      page: page,
      pageSize: this.data.pageSize
    }, { cacheTTL: config.CACHE_TTL.QUESTIONS })
      .then(function (result) {
        var list = (result && result.list) || [];
        var total = (result && result.total) || 0;

        if (isFirst) {
          // 初始化收藏状态
          var favMap = {};
          var analysisMap = {};
          var answers = {};

          list.forEach(function (q) {
            favMap[q._id] = q.isFavorited || false;
            analysisMap[q._id] = false;
          });

          self._vs.updateItems(list);
          self.setData({
            page: page,
            total: total || list.length,
            current: 1,
            loading: false,
            loadingMore: false,
            noMore: list.length >= (total || list.length),
            favMap: favMap,
            analysisMap: analysisMap,
            answers: answers,
            typeLabel: self._getTypeLabel(list[0])
          });

          self._elapsedTimer.start();
        } else {
          var prevList = self._vs._items || [];
          self._vs.appendItems(list);

          var newFavMap = self.data.favMap;
          var newAnalysisMap = self.data.analysisMap;
          list.forEach(function (q) {
            newFavMap[q._id] = q.isFavorited || false;
            newAnalysisMap[q._id] = false;
          });

          self.setData({
            page: page,
            loadingMore: false,
            noMore: prevList.length + list.length >= total,
            favMap: newFavMap,
            analysisMap: newAnalysisMap
          });
        }
      })
      .catch(function (err) {
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
        self.setData({
          loading: false,
          loadingMore: false
        });
      });
  },

  _goToQuestion: function (index) {
    var elapsed = this._elapsedTimer.stop();
    var qid = this._getCurrentQuestionId();
    if (qid) {
      var elapsedMap = this.data.elapsedMap;
      elapsedMap[qid] = elapsed;
      this.setData({ elapsedMap: elapsedMap });
    }

    var targetItem = this._vs._items[index - 1];
    this.setData({
      current: index,
      typeLabel: this._getTypeLabel(targetItem)
    });

    this._elapsedTimer.start();

    // 滚动到该题
    var itemPx = 400 * (this._vs._rpxRatio || 0.52);
    var targetScrollTop = (index - 1) * itemPx;
    this._vs._scrollTop = targetScrollTop;
    this._vs._recalc();
  },

  _getCurrentQuestionId: function () {
    var items = this._vs._items || [];
    var idx = this.data.current - 1;
    return items[idx] && items[idx]._id;
  },

  _getTypeLabel: function (item) {
    if (!item) return '';
    return config.TYPE_LABELS[item.type] || item.type || '';
  },

  _syncUserData: function () {
    var answers = this.data.answers;
    var elapsedMap = this.data.elapsedMap;
    var answerList = [];

    Object.keys(answers).forEach(function (qid) {
      answerList.push({
        questionId: qid,
        userAnswer: answers[qid],
        elapsed: elapsedMap[qid] || 0,
        chapterId: this.data.chapterId,
        subjectId: this.data.subjectId
      });
    }, this);

    if (answerList.length > 0) {
      request.callFunction('syncUserData', { answers: answerList }).catch(function () {});
    }
  }
});
