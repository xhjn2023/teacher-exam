/**
 * 格式化工具
 */
var TYPE_LABELS = require('./config').TYPE_LABELS;

/** 题目类型 → 中文 */
function questionType(type) { return TYPE_LABELS[type] || type; }

/** 补零 */
function pad(n) { return (n < 10 ? '0' : '') + n; }

/** 时间戳 → YYYY-MM-DD */
function formatDate(ts) {
  var d = ts ? new Date(ts) : new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

/** 时间戳 → YYYY年M月D日 */
function formatDateCN(ts) {
  var d = ts ? new Date(ts) : new Date();
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

/** 秒 → mm:ss */
function formatDuration(seconds) {
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  return pad(m) + ':' + pad(s);
}

/** 秒 → X时X分X秒 */
function formatDurationCN(seconds) {
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = seconds % 60;
  if (h > 0) return h + '时' + m + '分' + s + '秒';
  if (m > 0) return m + '分' + s + '秒';
  return s + '秒';
}

/** 正确率 → 百分比 */
function formatRate(correct, total) {
  if (!total) return '0%';
  return Math.round((correct / total) * 100) + '%';
}

/** 大数 → 简写 */
function formatCount(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

module.exports = {
  questionType: questionType,
  pad: pad,
  formatDate: formatDate,
  formatDateCN: formatDateCN,
  formatDuration: formatDuration,
  formatDurationCN: formatDurationCN,
  formatRate: formatRate,
  formatCount: formatCount
};
