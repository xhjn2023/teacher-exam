var app = getApp();

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    studyData: null,
    showLoginModal: false,
    tempUserInfo: {
      nickName: '',
      avatarUrl: ''
    }
  },

  onLoad: function () {
    var that = this;
    // 同步内存中的登录态到页面
    this._syncFromGlobal();

    // 订阅登录态变化（静默登录完成时会通知）
    this._loginCb = function (loggedIn) {
      that._syncFromGlobal();
    };
    app.onLoginStateChange(this._loginCb);
  },

  onShow: function () {
    this._syncFromGlobal();
  },

  onUnload: function () {
    if (this._loginCb) app.offLoginStateChange(this._loginCb);
  },

  // 从 globalData 同步登录态与学习数据
  _syncFromGlobal: function () {
    var g = app.globalData;
    this.setData({
      userInfo: g.userInfo || null,
      hasUserInfo: !!g.userInfo,
      studyData: g.studyData || {}
    });
  },

  // 显示登录弹窗（已登录则不弹）
  onShowLogin: function () {
    if (this.data.hasUserInfo) return;
    this.setData({
      showLoginModal: true,
      tempUserInfo: { nickName: '', avatarUrl: '' }
    });
  },

  // 隐藏登录弹窗
  onHideLogin: function () {
    this.setData({ showLoginModal: false });
  },

  // 选择头像
  onChooseAvatar: function (e) {
    this.setData({ 'tempUserInfo.avatarUrl': e.detail.avatarUrl });
  },

  // 输入昵称
  onNicknameInput: function (e) {
    this.setData({ 'tempUserInfo.nickName': e.detail.value });
  },

  // 确认登录
  onConfirmLogin: function () {
    var that = this;
    var tempInfo = this.data.tempUserInfo || {};

    if (!tempInfo.nickName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (!tempInfo.avatarUrl) {
      wx.showToast({ title: '请选择头像', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中...', mask: true });

    // 使用 app 提供的登录方法（自动持久化 + 通知）
    app.loginWithProfile(tempInfo.nickName, tempInfo.avatarUrl).then(function (result) {
      wx.hideLoading();
      that._syncFromGlobal();
      that.setData({ showLoginModal: false });

      if (result.isNewUser) {
        wx.showToast({ title: '欢迎加入，开始刷题吧', icon: 'none', duration: 2000 });
      } else {
        wx.showToast({ title: '登录成功', icon: 'success' });
      }
    }).catch(function (err) {
      wx.hideLoading();
      wx.showToast({ title: (err && err.msg) || '登录失败，请重试', icon: 'none' });
      console.error('Login error:', err);
    });
  },

  // 退出登录
  onLogout: function () {
    var that = this;
    wx.showModal({
      title: '退出登录',
      content: '退出后将无法同步学习数据，确定继续？',
      confirmColor: '#D96C6C',
      success: function (res) {
        if (res.confirm) {
          app.logout();
          that._syncFromGlobal();
          wx.showToast({ title: '已退出登录', icon: 'none' });
        }
      }
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
