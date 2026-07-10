var cache = require('./cache');
var config = require('./config');

var pendingRequests = {};

/**
 * 调用云函数（含缓存、去重、降级、断网处理）
 * @param {string} name 云函数名
 * @param {object} data 参数
 * @param {object} options {cacheTTL, forceRefresh}
 * @returns {Promise}
 */
function callFunction(name, data, options) {
  var opts = options || {};
  var cacheTTL = opts.cacheTTL || 0;
  var forceRefresh = opts.forceRefresh || false;
  var cacheKey = 'cf_' + name + '_' + JSON.stringify(data || {});

  // 请求去重
  if (pendingRequests[cacheKey]) return pendingRequests[cacheKey];

  // 缓存优先
  if (!forceRefresh && cacheTTL > 0) {
    var cached = cache.getCache(cacheKey);
    if (cached) return Promise.resolve(cached);
  }

  var requestPromise = checkNetwork().then(function (networkType) {
    // 断网 → 降级缓存
    if (networkType === 'none') {
      var offlineCache = cache.getCache(cacheKey);
      if (offlineCache) {
        getApp().globalData.isOffline = true;
        return offlineCache;
      }
      return Promise.reject({ code: 'OFFLINE_NO_CACHE' });
    }

    return wx.cloud.callFunction({ name: name, data: data }).then(function (res) {
      var result = res.result;
      if (cacheTTL > 0 && result) cache.setCache(cacheKey, result, cacheTTL);
      return result;
    }).catch(function (err) {
      // 云函数异常 → 降级缓存
      var fallback = cache.getCache(cacheKey);
      if (fallback) return fallback;
      return Promise.reject(err);
    });
  });

  pendingRequests[cacheKey] = requestPromise;
  requestPromise.then(function () { delete pendingRequests[cacheKey]; }).catch(function () { delete pendingRequests[cacheKey]; });
  return requestPromise;
}

function checkNetwork() {
  return new Promise(function (resolve) {
    wx.getNetworkType({
      success: function (res) { resolve(res.networkType); },
      fail: function () { resolve('unknown'); }
    });
  });
}

/**
 * 简洁 Toast
 */
function showToast(title, icon) {
  wx.showToast({ title: title, icon: icon || 'none', duration: config.TOAST.NORMAL, mask: false });
}

/**
 * 加载中
 */
function showLoading(title) {
  wx.showLoading({ title: title || '加载中', mask: true });
}
function hideLoading() { wx.hideLoading(); }

module.exports = {
  callFunction: callFunction,
  showToast: showToast,
  showLoading: showLoading,
  hideLoading: hideLoading
};
