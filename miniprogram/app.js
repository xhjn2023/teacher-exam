/**
 * 教师编制刷题 — 小程序入口
 * 云开发初始化、全局状态管理、网络监听、离线队列同步
 */
var config = require('./utils/config');
var cache = require('./utils/cache');

App({
  onLaunch: function () {
    var that = this;
    this.globalData = {
      isOffline: false,
      studyData: null,
      offlineAnswers: []
    };

    // 云开发初始化
    if (wx.cloud) {
      wx.cloud.init({
        env: config.CLOUD_ENV,
        traceUser: true
      });
    }

    // 加载用户学习数据摘要
    this.loadUserSummary();

    // 监听网络状态变化
    wx.onNetworkStatusChange(function (res) {
      var wasOffline = that.globalData.isOffline;

      if (res.isConnected && wasOffline) {
        // 恢复网络 → 同步离线数据
        that.globalData.isOffline = false;
        that.syncOfflineAnswers();
        wx.showToast({
          title: '网络已恢复',
          icon: 'success',
          duration: 1500
        });
      } else if (!res.isConnected && !wasOffline) {
        that.globalData.isOffline = true;
      }
    });
  },

  // 获取网络状态
  getNetworkType: function () {
    return new Promise(function (resolve) {
      wx.getNetworkType({
        success: function (res) { resolve(res.networkType); },
        fail: function () { resolve('unknown'); }
      });
    });
  },

  // 判断是否离线
  isOffline: function () {
    return this.globalData.isOffline;
  },

  // 加载用户学习数据摘要
  loadUserSummary: function () {
    var that = this;
    try {
      wx.cloud.callFunction({
        name: 'getUserProfile',
        data: {}
      }).then(function (res) {
        if (res.result) {
          that.globalData.studyData = res.result;
        }
      }).catch(function () {
        // 静默降级
      });
    } catch (e) {
      // 云开发未初始化
    }
  },

  // 添加离线答题记录
  addOfflineAnswer: function (answer) {
    var list = this.globalData.offlineAnswers;
    list.push(answer);
    cache.setCache('offline_answers', list, 0);
    this.globalData.offlineAnswers = list;
  },

  // 同步离线答题记录
  syncOfflineAnswers: function () {
    var that = this;
    var cached = cache.getCache('offline_answers');
    if (!cached || !cached.length) return;

    try {
      wx.cloud.callFunction({
        name: 'syncUserData',
        data: { answers: cached }
      }).then(function (res) {
        cache.setCache('offline_answers', [], 0);
        that.globalData.offlineAnswers = [];
        that.loadUserSummary();
      }).catch(function () {
        // 同步失败，保留队列下次重试
      });
    } catch (e) {
      // 云开发未初始化
    }
  },

  // 全局网络变化回调
  onNetworkChange: function (status) {
    var pages = getCurrentPages();
    if (pages.length > 0) {
      var currentPage = pages[pages.length - 1];
      if (currentPage.setData) {
        currentPage.setData({ _isOffline: status === 'offline' });
      }
    }
  }
});
