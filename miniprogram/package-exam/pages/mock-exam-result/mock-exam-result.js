var format = require('../../utils/format');

Page({
  data: {
    score: 0,
    correctCount: 0,
    totalCount: 0,
    correctRate: '0%',
    ringDeg: 0,
    ringColor: '#E8ECEB',
    showAnimation: false
  },

  onLoad: function (options) {
    var score = parseInt(options.score, 10) || 0;
    var correctCount = parseInt(options.correctCount, 10) || 0;
    var totalCount = parseInt(options.totalCount, 10) || 0;
    var rate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    var deg = totalCount > 0 ? Math.round((correctCount / totalCount) * 360) : 0;

    var ringColor = '#D96C6C';
    if (rate >= 80) ringColor = '#5B8C7E';
    else if (rate >= 60) ringColor = '#E8913A';

    this.setData({
      score: score,
      correctCount: correctCount,
      totalCount: totalCount,
      correctRate: rate + '%',
      ringDeg: deg,
      ringColor: ringColor
    });

    var that = this;
    setTimeout(function () {
      that.setData({ showAnimation: true });
    }, 200);
  },

  goHome: function () {
    wx.switchTab({ url: '/pages/index/index' });
  },

  goErrorBook: function () {
    wx.navigateTo({ url: '/package-user/pages/error-book/error-book' });
  }
});
