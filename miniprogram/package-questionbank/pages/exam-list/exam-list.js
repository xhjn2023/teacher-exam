var request = require('../../utils/request');
var config = require('../../utils/config');

Page({
  data: {
    loading: true,
    examTypes: []
  },

  onLoad: function () {
    var that = this;
    request.callFunction('getExamTypes', {}, { cacheTTL: config.CACHE_TTL.EXAM_TYPES })
      .then(function (res) {
        that.setData({
          examTypes: (res && res.list) || [],
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
      url: '/package-questionbank/pages/subject-list/subject-list?examTypeId=' + item._id + '&title=' + encodeURIComponent(item.name)
    });
  }
});
