/**
 * 答题音效工具
 * 使用 InnerAudioContext 播放对/错音效，失败静默降级
 */

var correctAudio = null;
var wrongAudio = null;
var enabled = true;

/**
 * 检查用户是否开启音效（从本地缓存读取设置）
 */
function checkEnabled() {
  try {
    var settings = wx.getStorageSync('user_settings');
    if (settings && typeof settings.soundEnabled !== 'undefined') {
      enabled = !!settings.soundEnabled;
    }
  } catch (e) {}
  return enabled;
}

/**
 * 播放答对音效
 */
function playCorrect() {
  if (!checkEnabled()) return;
  try {
    if (!correctAudio) {
      correctAudio = wx.createInnerAudioContext();
      correctAudio.src = 'https://mp-1258205909.cos.ap-shanghai.myqcloud.com/sfx/correct.mp3';
      correctAudio.volume = 0.5;
    }
    correctAudio.stop();
    correctAudio.play();
  } catch (e) {}
}

/**
 * 播放答错音效
 */
function playWrong() {
  if (!checkEnabled()) return;
  try {
    if (!wrongAudio) {
      wrongAudio = wx.createInnerAudioContext();
      wrongAudio.src = 'https://mp-1258205909.cos.ap-shanghai.myqcloud.com/sfx/wrong.mp3';
      wrongAudio.volume = 0.5;
    }
    wrongAudio.stop();
    wrongAudio.play();
  } catch (e) {}
}

/**
 * 设置音效开关
 */
function setEnabled(val) {
  enabled = !!val;
  try {
    var settings = wx.getStorageSync('user_settings') || {};
    settings.soundEnabled = enabled;
    wx.setStorageSync('user_settings', settings);
  } catch (e) {}
}

function isEnabled() {
  return checkEnabled();
}

module.exports = {
  playCorrect: playCorrect,
  playWrong: playWrong,
  setEnabled: setEnabled,
  isEnabled: isEnabled
};
