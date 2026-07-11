/**
 * 教师编制刷题 — 小程序入口
 * 云开发初始化、登录态管理、全局状态、网络监听、离线队列同步
 */
var config = require('./utils/config');
var cache = require('./utils/cache');

// 登录态常量
var LOGIN_KEY = config.CACHE_KEYS.LOGIN_INFO;
var LOGIN_TTL = config.CACHE_TTL.LOGIN_INFO;

App({
  onLaunch: function () {
    var that = this;
    this.globalData = {
      isOffline: false,
      studyData: null,
      userInfo: null,
      userId: '',
      offlineAnswers: []
    };

    // 云开发初始化
    if (wx.cloud) {
      wx.cloud.init({
        env: config.CLOUD_ENV,
        traceUser: true
      });
    }

    // 1. 先从本地缓存恢复登录态（毫秒级，保证 UI 立即显示）
    this.restoreLoginState();

    // 2. 静默登录（用 OPENID 换取/刷新用户信息）
    this.silentLogin();

    // 3. 监听网络状态变化
    wx.onNetworkStatusChange(function (res) {
      var wasOffline = that.globalData.isOffline;

      if (res.isConnected && wasOffline) {
        that.globalData.isOffline = false;
        that.syncOfflineAnswers();
        // 网络恢复后重新拉取一次学习数据
        that.loadUserSummary();
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

  // ============ 登录态管理 ============

  /**
   * 从本地缓存恢复登录态（冷启动时立即调用）
   */
  restoreLoginState: function () {
    var cached = cache.getCache(LOGIN_KEY);
    if (cached && cached.userInfo) {
      this.globalData.userInfo = cached.userInfo;
      this.globalData.userId = cached.userId || '';
      this.globalData.studyData = cached.studyData || null;
    }
  },

  /**
   * 静默登录：仅用 OPENID 换取 userId 与学习数据
   * 不需要用户手动操作，每次启动调用一次
   * @returns {Promise}
   */
  silentLogin: function () {
    var that = this;
    return new Promise(function (resolve) {
      try {
        wx.cloud.callFunction({
          name: 'login',
          data: {}
        }).then(function (res) {
          var result = res.result;
          if (!result || result.code !== 0) {
            resolve(false);
            return;
          }

          // 仅当云端有昵称/头像时才覆盖本地（避免静默登录清空用户已填信息）
          var local = that.globalData.userInfo || {};
          var userInfo = {
            nickName: (result.userInfo && result.userInfo.nickName) || local.nickName || '',
            avatarUrl: (result.userInfo && result.userInfo.avatarUrl) || local.avatarUrl || ''
          };
          var studyData = result.studyData || that.globalData.studyData || {};

          that.globalData.userInfo = userInfo;
          that.globalData.userId = result.userId || '';
          that.globalData.studyData = studyData;

          // 持久化登录态
          cache.setCache(LOGIN_KEY, {
            userId: result.userId,
            userInfo: userInfo,
            studyData: studyData
          }, LOGIN_TTL);

          // 通知页面登录态已就绪
          that._notifyLoginState(true);
          resolve(true);
        }).catch(function () {
          // 静默失败，不影响用户使用
          resolve(false);
        });
      } catch (e) {
        // 云开发未初始化
        resolve(false);
      }
    });
  },

  /**
   * 用户主动登录（携带昵称/头像）
   * @param {string} nickName
   * @param {string} avatarUrl
   * @returns {Promise}
   */
  loginWithProfile: function (nickName, avatarUrl) {
    var that = this;
    return new Promise(function (resolve, reject) {
      try {
        wx.cloud.callFunction({
          name: 'login',
          data: { nickName: nickName, avatarUrl: avatarUrl }
        }).then(function (res) {
          var result = res.result;
          if (!result || result.code !== 0) {
            reject(result || { msg: '登录失败' });
            return;
          }
          var userInfo = result.userInfo || { nickName: nickName, avatarUrl: avatarUrl };
          var studyData = result.studyData || {};

          that.globalData.userInfo = userInfo;
          that.globalData.userId = result.userId || '';
          that.globalData.studyData = studyData;

          cache.setCache(LOGIN_KEY, {
            userId: result.userId,
            userInfo: userInfo,
            studyData: studyData
          }, LOGIN_TTL);

          that._notifyLoginState(true);
          resolve(result);
        }).catch(function (err) {
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  },

  /**
   * 退出登录：清除本地登录态
   */
  logout: function () {
    this.globalData.userInfo = null;
    this.globalData.userId = '';
    this.globalData.studyData = null;
    cache.setCache(LOGIN_KEY, null, 0);
    wx.removeStorageSync(LOGIN_KEY);
    this._notifyLoginState(false);
  },

  /**
   * 判断当前是否已登录
   */
  isLoggedIn: function () {
    return !!(this.globalData.userInfo && this.globalData.userId);
  },

  /**
   * 确保已登录后再执行后续逻辑
   * 受保护接口调用前使用：app.ensureLogin().then(...)
   * @returns {Promise}
   */
  ensureLogin: function () {
    var that = this;
    if (this.isLoggedIn()) {
      return Promise.resolve(this.globalData.userInfo);
    }
    // 尝试静默登录一次
    return this.silentLogin().then(function () {
      if (that.isLoggedIn()) {
        return that.globalData.userInfo;
      }
      return Promise.reject({ code: 'NOT_LOGGED_IN', msg: '请先登录' });
    });
  },

  /**
   * 登录态变化通知（供页面订阅）
   */
  _loginListeners: [],
  onLoginStateChange: function (cb) {
    this._loginListeners.push(cb);
  },
  offLoginStateChange: function (cb) {
    var idx = this._loginListeners.indexOf(cb);
    if (idx >= 0) this._loginListeners.splice(idx, 1);
  },
  _notifyLoginState: function (loggedIn) {
    for (var i = 0; i < this._loginListeners.length; i++) {
      try { this._loginListeners[i](loggedIn); } catch (e) {}
    }
  },

  // ============ 数据加载 ============

  /**
   * 加载用户学习数据摘要（更新 globalData.studyData）
   */
  loadUserSummary: function () {
    var that = this;
    if (!this.isLoggedIn()) return;
    try {
      wx.cloud.callFunction({
        name: 'getUserProfile',
        data: {}
      }).then(function (res) {
        if (res.result) {
          that.globalData.studyData = res.result;
          // 同步更新持久化缓存中的 studyData
          var cached = cache.getCache(LOGIN_KEY);
          if (cached) {
            cached.studyData = res.result;
            cache.setCache(LOGIN_KEY, cached, LOGIN_TTL);
          }
        }
      }).catch(function () {
        // 静默降级
      });
    } catch (e) {
      // 云开发未初始化
    }
  },

  // ============ 离线队列 ============

  /**
   * 添加离线答题记录
   */
  addOfflineAnswer: function (answer) {
    var list = this.globalData.offlineAnswers;
    list.push(answer);
    cache.setCache('offline_answers', list, 0);
    this.globalData.offlineAnswers = list;
  },

  /**
   * 同步离线答题记录
   */
  syncOfflineAnswers: function () {
    var that = this;
    var cached = cache.getCache('offline_answers');
    if (!cached || !cached.length) return;

    this.ensureLogin().then(function () {
      return wx.cloud.callFunction({
        name: 'syncUserData',
        data: { answers: cached }
      });
    }).then(function () {
      cache.setCache('offline_answers', [], 0);
      that.globalData.offlineAnswers = [];
      that.loadUserSummary();
    }).catch(function () {
      // 同步失败，保留队列下次重试
    });
  },

  // ============ 网络 ============

  /**
   * 获取网络状态
   */
  getNetworkType: function () {
    return new Promise(function (resolve) {
      wx.getNetworkType({
        success: function (res) { resolve(res.networkType); },
        fail: function () { resolve('unknown'); }
      });
    });
  },

  /**
   * 判断是否离线
   */
  isOffline: function () {
    return this.globalData.isOffline;
  },

  /**
   * 全局网络变化回调
   */
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
