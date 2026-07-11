var request = require('../../../utils/request');
var config = require('../../../utils/config');

Page({
  data: {
    examTypeId: '',
    title: '',
    loading: true,
    subjects: []
  },

  onLoad: function (options) {
    var examTypeId = options.examTypeId || '';
    var title = decodeURIComponent(options.title || '科目列表');

    wx.setNavigationBarTitle({ title: title });

    this.setData({
      examTypeId: examTypeId,
      title: title
    });

    var that = this;
    request.callFunction('getSubjects', { examTypeId: examTypeId }, { cacheTTL: config.CACHE_TTL.SUBJECTS })
      .then(function (res) {
        that.setData({
          subjects: (res && res.list) || [],
          loading: false
        });
      })
      .catch(function () {
        that.setData({ loading: false });
        request.showToast('加载失败，请重试');
      });
  },

  onItemTap: function (e) {
    var item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '/package-questionbank/pages/chapter-list/chapter-list?subjectId=' + item._id + '&title=' + encodeURIComponent(item.name)
    });
  }
});
