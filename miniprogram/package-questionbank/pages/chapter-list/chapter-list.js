var request = require('../../../utils/request');
var config = require('../../../utils/config');

Page({
  data: {
    subjectId: '',
    title: '',
    loading: true,
    chapters: []
  },

  onLoad: function (options) {
    var subjectId = options.subjectId || '';
    var title = decodeURIComponent(options.title || '章节列表');

    wx.setNavigationBarTitle({ title: title });

    this.setData({
      subjectId: subjectId,
      title: title
    });

    var that = this;
    request.callFunction('getChapters', { subjectId: subjectId }, { cacheTTL: config.CACHE_TTL.CHAPTERS })
      .then(function (res) {
        that.setData({
          chapters: (res && res.list) || [],
          loading: false
        });
      })
      .catch(function () {
        that.setData({ loading: false });
        request.showToast('加载失败，请重试');
      });
  },

  onChapterTap: function (e) {
    var item = e.currentTarget.dataset.item;
    if (item.type === 'real-paper') {
      wx.navigateTo({
        url: '/package-questionbank/pages/real-paper-list/real-paper-list?subjectId=' + this.data.subjectId + '&title=' + encodeURIComponent(item.name)
      });
    } else {
      wx.navigateTo({
        url: '/package-questionbank/pages/chapter-practice/chapter-practice?subjectId=' + this.data.subjectId + '&chapterId=' + item._id + '&chapterTitle=' + encodeURIComponent(item.name)
      });
    }
  }
});
