var config = require('./config');

/**
 * 写入缓存
 * @param {string} key
 * @param {*} data
 * @param {number} ttl 过期时间(ms)，0 = 永不过期
 */
function setCache(key, data, ttl) {
  var record = { data: data, expireAt: ttl ? Date.now() + ttl : 0 };
  try {
    wx.setStorageSync(key, record);
  } catch (e) {
    clearOldestCache();
    try { wx.setStorageSync(key, record); } catch (e2) {}
  }
}

/**
 * 读取缓存
 * @param {string} key
 * @returns {*|null}
 */
function getCache(key) {
  var record = wx.getStorageSync(key);
  if (!record) return null;
  if (record.expireAt && Date.now() > record.expireAt) {
    wx.removeStorageSync(key);
    return null;
  }
  return record.data;
}

/**
 * 按前缀获取所有匹配的缓存 key
 * @param {string} prefix
 * @returns {Array}
 */
function getKeysByPrefix(prefix) {
  var info = wx.getStorageInfoSync();
  var keys = info.keys || [];
  var result = [];
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].indexOf(prefix) === 0) result.push(keys[i]);
  }
  return result;
}

/**
 * 按前缀清除缓存
 * @param {string} prefix
 */
function clearByPrefix(prefix) {
  var keys = getKeysByPrefix(prefix);
  for (var i = 0; i < keys.length; i++) {
    wx.removeStorageSync(keys[i]);
  }
}

/**
 * 清除最旧的缓存（存储满时调用）
 */
function clearOldestCache() {
  var info = wx.getStorageInfoSync();
  if (!info.keys || !info.keys.length) return;
  wx.removeStorageSync(info.keys[0]);
}

/**
 * 清除全部缓存
 */
function clearAllCache() {
  try { wx.clearStorageSync(); } catch (e) {}
}

module.exports = {
  setCache: setCache,
  getCache: getCache,
  getKeysByPrefix: getKeysByPrefix,
  clearByPrefix: clearByPrefix,
  clearAllCache: clearAllCache
};
