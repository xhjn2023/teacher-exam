var app = getApp();
var request = require('../../../utils/request');

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    studyData: null,
    showLoginModal: false
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

  // 显示登录弹窗
  onShowLogin: function () {
    this.setData({ showLoginModal: true });
  },

  // 隐藏登录弹窗
  onHideLogin: function () {
    this.setData({ showLoginModal: false });
  },

  // 选择头像
  onChooseAvatar: function (e) {
    var avatarUrl = e.detail.avatarUrl;
    this.setData({
      'tempUserInfo.avatarUrl': avatarUrl
    });
  },

  // 输入昵称
  onNicknameInput: function (e) {
    this.setData({
      'tempUserInfo.nickName': e.detail.value
    });
  },

  // 确认登录
  onConfirmLogin: function () {
    var that = this;
    var tempInfo = this.data.tempUserInfo || {};

    if (!tempInfo.nickName || !tempInfo.avatarUrl) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    // 调用登录云函数
    request.callFunction('login', {
      nickName: tempInfo.nickName,
      avatarUrl: tempInfo.avatarUrl
    }, { forceRefresh: true }).then(function (res) {
      wx.hideLoading();
      if (res && res.code === 0) {
        var userInfo = {
          nickName: res.nickName,
          avatarUrl: res.avatarUrl
        };
        that.setData({
          userInfo: userInfo,
          hasUserInfo: true,
          showLoginModal: false,
          tempUserInfo: null
        });
        app.globalData.userInfo = userInfo;
        wx.showToast({ title: '登录成功', icon: 'success' });
      } else {
        wx.showToast({ title: res.msg || '登录失败', icon: 'none' });
      }
    }).catch(function (err) {
      wx.hideLoading();
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      console.error('Login error:', err);
    });
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
