var request = require('../../../utils/request');
var cache = require('../../../utils/cache');

Page({
  data: {
    cacheSize: '计算中…',
    version: '1.0.0'
  },

  onLoad: function () {
    this._calcCacheSize();
  },

  _calcCacheSize: function () {
    var that = this;
    try {
      var res = wx.getStorageInfoSync();
      var sizeKB = res.currentSize || 0;
      if (sizeKB >= 1024) {
        that.setData({ cacheSize: (sizeKB / 1024).toFixed(1) + ' MB' });
      } else {
        that.setData({ cacheSize: sizeKB + ' KB' });
      }
    } catch (e) {
      that.setData({ cacheSize: '0 KB' });
    }
  },

  onClearCache: function () {
    var that = this;
    wx.showModal({
      title: '清除缓存',
      content: '清除后需重新加载数据，确定继续？',
      confirmColor: '#5B8C7E',
      success: function (modalRes) {
        if (modalRes.confirm) {
          that._confirmClear();
        }
      }
    });
  },

  _confirmClear: function () {
    var that = this;
    wx.showModal({
      title: '再次确认',
      content: '此操作不可撤销，确定清除吗？',
      confirmColor: '#D96C6C',
      success: function (modalRes) {
        if (modalRes.confirm) {
          that._doClear();
        }
      }
    });
  },

  _doClear: function () {
    try {
      // 保留必要缓存 key：用户设置 + 登录态（清缓存不应让用户掉登录）
      var keepKeys = ['user_settings', 'login_info'];
      var info = wx.getStorageInfoSync();
      var keys = info.keys || [];
      keys.forEach(function (key) {
        if (keepKeys.indexOf(key) === -1) {
          wx.removeStorageSync(key);
        }
      });
    } catch (e) {
      // 降级处理
    }

    this._calcCacheSize();
    request.showToast('缓存已清除');
  },

  onAboutTap: function () {
    var that = this;
    wx.showModal({
      title: '关于我们',
      content: '教师编制刷题 v' + that.data.version + '\n\n助力每一位考编路上的追梦人\n\n用心打磨每一道题，陪你走到上岸的那一天。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#5B8C7E'
    });
  }
});
