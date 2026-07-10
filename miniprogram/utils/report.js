/**
 * 数据上报工具（轻量、非侵入）
 */
module.exports = {
  /** 页面浏览 */
  trackPage: function (pageName) {
    try {
      if (wx.reportAnalytics) {
        wx.reportAnalytics('page_view', { page: pageName });
      }
    } catch (e) {}
  },

  /** 事件上报 */
  trackEvent: function (action, params) {
    try {
      var data = params || {};
      data.action = action;
      if (wx.reportAnalytics) {
        wx.reportAnalytics('user_event', data);
      }
    } catch (e) {}
  },

  /** 题目作答 */
  trackAnswer: function (questionId, isCorrect, duration) {
    try {
      if (wx.reportAnalytics) {
        wx.reportAnalytics('answer_event', {
          questionId: questionId,
          isCorrect: isCorrect ? 1 : 0,
          duration: duration || 0
        });
      }
    } catch (e) {}
  }
};
