var request = require('../../utils/request');

Page({
  data: {
    keyword: '',
    results: [],
    hasSearched: false,
    searching: false,
    noMore: false,
    page: 1,
    pageSize: 20,
    loadingMore: false
  },

  onInput: function (e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch: function () {
    var keyword = this.data.keyword.trim();
    if (!keyword) {
      request.showToast('输入关键词再搜吧');
      return;
    }
    this.setData({ page: 1, hasSearched: true, searching: true, noMore: false });
    this._doSearch(1);
  },

  onClear: function () {
    this.setData({
      keyword: '',
      results: [],
      hasSearched: false
    });
  },

  onReachBottom: function () {
    if (this.data.loadingMore || this.data.noMore) return;
    this._doSearch(this.data.page + 1);
  },

  onItemTap: function (e) {
    var item = e.currentTarget.dataset.item;
    // 跳转到题目详情/章节练习
    if (item.chapterId && item.subjectId) {
      wx.navigateTo({
        url: '/package-questionbank/pages/chapter-practice/chapter-practice?subjectId=' + item.subjectId + '&chapterId=' + item.chapterId + '&questionId=' + item._id
      });
    } else {
      request.showToast('该题暂无关联章节');
    }
  },

  _doSearch: function (page) {
    var that = this;
    var isFirst = page === 1;

    if (!isFirst) this.setData({ loadingMore: true });

    request.callFunction('searchQuestions', {
      keyword: this.data.keyword,
      page: page,
      pageSize: this.data.pageSize
    })
      .then(function (res) {
        var list = (res && res.list) || [];
        var total = (res && res.total) || 0;

        if (isFirst) {
          that.setData({
            results: list,
            page: page,
            searching: false,
            noMore: list.length >= total
          });
        } else {
          var prev = that.data.results;
          that.setData({
            results: prev.concat(list),
            page: page,
            loadingMore: false,
            noMore: prev.length + list.length >= total
          });
        }
      })
      .catch(function () {
        if (isFirst) {
          that.setData({ searching: false });
          request.showToast('搜索失败，请重试');
        } else {
          that.setData({ loadingMore: false });
          request.showToast('加载失败');
        }
      });
  }
});
