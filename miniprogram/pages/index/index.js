var app = getApp();
var request = require('../../utils/request');
var config = require('../../utils/config');

Page({
  data: {
    _isOffline: false,
    greeting: '',
    examTypes: [],
    studyData: null
  },

  onLoad: function () {
    var that = this;
    var greetings = ['早上好！', '下午好！', '晚上好！', '今天也要加油呀'];
    var hour = new Date().getHours();
    if (hour < 12) this.setData({ greeting: greetings[0] });
    else if (hour < 18) this.setData({ greeting: greetings[1] });
    else this.setData({ greeting: greetings[2] });
    this.setData({ studyData: app.globalData.studyData });

    request.callFunction('getExamTypes', {}, { cacheTTL: config.CACHE_TTL.EXAM_TYPES })
      .then(function (res) { that.setData({ examTypes: (res && res.list) || [] }); })
      .catch(function () {});
  },

  onShow: function () {
    this.setData({ studyData: app.globalData.studyData, _isOffline: app.globalData.isOffline });
  },

  onEnter: function (e) {
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({ url: '/package-questionbank/pages/subject-list/subject-list?examTypeId=' + type._id + '&title=' + encodeURIComponent(type.name) });
  },

  goRecite: function () {
    wx.navigateTo({ url: '/package-questionbank/pages/subjective-recite/subjective-recite' });
  },

  goSearch: function () {
    wx.navigateTo({ url: '/pages/search/search' });
  }
});
