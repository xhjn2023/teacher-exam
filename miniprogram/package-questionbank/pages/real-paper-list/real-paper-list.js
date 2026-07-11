var request = require('../../../utils/request');
var config = require('../../../utils/config');

Page({
  data: {
    subjectId: '',
    title: '',
    loading: true,
    loadingMore: false,
    noMore: false,
    page: 1,
    pageSize: config.REAL_PAPER_PAGE_SIZE || 15,
    papers: []
  },

  onLoad: function (options) {
    var subjectId = options.subjectId || '';
    var title = decodeURIComponent(options.title || '真题套卷');

    wx.setNavigationBarTitle({ title: title });

    this.setData({
      subjectId: subjectId,
      title: title
    });

    this._loadPapers(1);
  },

  onReachBottom: function () {
    if (this.data.loadingMore || this.data.noMore) return;
    this._loadPapers(this.data.page + 1);
  },

  onItemTap: function (e) {
    var item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '/package-questionbank/pages/real-paper-exam/real-paper-exam?paperId=' + item._id + '&title=' + encodeURIComponent(item.title || item.name)
    });
  },

  _loadPapers: function (page) {
    var that = this;
    var isFirst = page === 1;

    if (isFirst) {
      this.setData({ loading: true });
    } else {
      this.setData({ loadingMore: true });
    }

    request.callFunction('getRealPapers', {
      subjectId: this.data.subjectId,
      page: page,
      pageSize: this.data.pageSize
    }, { cacheTTL: config.CACHE_TTL.REAL_PAPERS })
      .then(function (res) {
        var list = (res && res.list) || [];
        var total = (res && res.total) || 0;

        if (isFirst) {
          that.setData({
            papers: list,
            page: page,
            loading: false,
            noMore: list.length >= total
          });
        } else {
          var prev = that.data.papers;
          that.setData({
            papers: prev.concat(list),
            page: page,
            loadingMore: false,
            noMore: prev.length + list.length >= total
          });
        }
      })
      .catch(function () {
        if (isFirst) {
          that.setData({ loading: false });
          request.showToast('加载失败，请重试');
        } else {
          that.setData({ loadingMore: false });
          request.showToast('加载失败');
        }
      });
  }
});
