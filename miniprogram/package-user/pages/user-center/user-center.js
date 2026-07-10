var app = getApp();
var request = require('../../utils/request');

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    studyData: null
  },

  onLoad: function () {
    var appGlobal = app.globalData;
    if (appGlobal.userInfo) {
      this.setData({
        userInfo: appGlobal.userInfo,
        hasUserInfo: true
      });
    }
    this.setData({ studyData: appGlobal.studyData || {} });
  },

  onShow: function () {
    this.setData({ studyData: app.globalData.studyData || {} });
    if (app.globalData.userInfo && !this.data.hasUserInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    }
  },

  onGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
      app.globalData.userInfo = e.detail.userInfo;
    }
  },

  goErrorBook: function () {
    wx.navigateTo({ url: '/package-user/pages/error-book/error-book' });
  },

  goFavorites: function () {
    wx.navigateTo({ url: '/package-user/pages/favorites/favorites' });
  },

  goStats: function () {
    wx.navigateTo({ url: '/package-user/pages/stats/stats' });
  },

  goSettings: function () {
    wx.navigateTo({ url: '/package-user/pages/settings/settings' });
  }
});
