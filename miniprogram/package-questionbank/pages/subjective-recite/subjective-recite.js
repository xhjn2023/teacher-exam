var request = require('../../utils/request');
var config = require('../../utils/config');

Page({
  data: {
    subjectId: '',
    items: [],
    current: 1,
    total: 0,
    currentItem: null,
    typeLabel: '',

    // 分页
    page: 1,
    pageSize: 10,
    loading: true,
    loadingMore: false,
    noMore: false
  },

  onLoad: function (options) {
    var subjectId = options.subjectId || '';

    wx.setNavigationBarTitle({ title: '主观题背诵' });

    this.setData({ subjectId: subjectId });

    this._loadData(1);
  },

  onReachBottom: function () {
    if (this.data.loadingMore || this.data.noMore) return;
    var nextPage = this.data.page + 1;
    this._loadData(nextPage);
  },

  /**
   * 上一题
   */
  prevQ: function () {
    if (this.data.current <= 1) return;
    var newCurrent = this.data.current - 1;
    this.setData({ current: newCurrent });
    this._updateCurrentItem();

    // 滚动到顶部
    this._scrollToTop();
  },

  /**
   * 下一题
   */
  nextQ: function () {
    if (this.data.current >= this.data.items.length) {
      if (!this.data.noMore) {
        this._loadData(this.data.page + 1);
      }
      return;
    }

    var newCurrent = this.data.current + 1;
    this.setData({ current: newCurrent });
    this._updateCurrentItem();

    // 预加载更多
    if (newCurrent >= this.data.items.length - 3 && !this.data.noMore) {
      this._loadData(this.data.page + 1);
    }

    this._scrollToTop();
  },

  /**
   * 返回
   */
  goBack: function () {
    wx.navigateBack();
  },

  /* ========== 内部方法 ========== */

  _loadData: function (page) {
    var self = this;
    var isFirst = page === 1;

    if (isFirst) {
      this.setData({ loading: true });
    } else {
      this.setData({ loadingMore: true });
    }

    request.callFunction('getSubjectiveQuestions', {
      subjectId: this.data.subjectId,
      page: page,
      pageSize: this.data.pageSize
    })
      .then(function (result) {
        var list = (result && result.list) || [];
        var total = (result && result.total) || 0;

        if (isFirst) {
          self.setData({
            items: list,
            total: total || list.length,
            current: list.length > 0 ? 1 : 0,
            page: page,
            loading: false,
            loadingMore: false,
            noMore: list.length >= (total || list.length)
          });
          self._updateCurrentItem();
        } else {
          var newItems = self.data.items.concat(list);
          self.setData({
            items: newItems,
            total: total,
            page: page,
            loadingMore: false,
            noMore: newItems.length >= total
          });
        }
      })
      .catch(function () {
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
        self.setData({
          loading: false,
          loadingMore: false
        });
      });
  },

  _updateCurrentItem: function () {
    var idx = this.data.current - 1;
    var item = this.data.items[idx];
    if (item) {
      this.setData({
        currentItem: item,
        typeLabel: config.TYPE_LABELS[item.type] || item.type || ''
      });
    }
  },

  _scrollToTop: function () {
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  }
});
