var request = require('../../utils/request');
var format = require('../../utils/format');

Page({
  data: {
    loading: true,
    totalDays: 0,
    totalCount: 0,
    correctRate: '0%',
    dailyData: [],
    subjectRates: [],
    canvasReady: false
  },

  onLoad: function () {
    this._loadStats();
  },

  onReady: function () {
    this.setData({ canvasReady: true });
    if (this.data.dailyData.length > 0) {
      this._drawChart();
    }
  },

  _loadStats: function () {
    var that = this;
    request.callFunction('getStats', {})
      .then(function (res) {
        var data = res || {};
        var totalDays = data.totalDays || 0;
        var totalCount = data.totalCount || 0;
        var correctRate = format.formatRate(data.correctCount || 0, data.totalCount || 0);
        var dailyData = data.dailyData || [];
        var subjectRates = data.subjectRates || [];

        // 补全近30天数据
        if (dailyData.length < 30) {
          var paddedDailyData = that._padDailyData(dailyData, 30);
          that.setData({ dailyData: paddedDailyData });
        }

        that.setData({
          totalDays: totalDays,
          totalCount: totalCount,
          correctRate: correctRate,
          dailyData: dailyData,
          subjectRates: subjectRates,
          loading: false
        });

        if (that.data.canvasReady && dailyData.length > 0) {
          that._drawChart();
        }
      })
      .catch(function () {
        that.setData({ loading: false });
        request.showToast('加载失败，请重试');
      });
  },

  _padDailyData: function (data, days) {
    var result = [];
    var now = new Date();
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      var dateStr = format.formatDate(d.getTime());
      var found = null;
      for (var j = 0; j < data.length; j++) {
        if (data[j].date === dateStr) {
          found = data[j];
          break;
        }
      }
      result.push(found || { date: dateStr, count: 0 });
    }
    return result;
  },

  _drawChart: function () {
    var ctx = wx.createCanvasContext('dailyChart', this);
    var dailyData = this.data.dailyData;
    var maxCount = 0;
    for (var i = 0; i < dailyData.length; i++) {
      if (dailyData[i].count > maxCount) maxCount = dailyData[i].count;
    }
    if (maxCount === 0) maxCount = 10;

    var canvasWidth = 690;
    var canvasHeight = 360;
    var paddingL = 40;
    var paddingR = 20;
    var paddingT = 20;
    var paddingB = 30;
    var chartW = canvasWidth - paddingL - paddingR;
    var chartH = canvasHeight - paddingT - paddingB;
    var barW = Math.floor(chartW / dailyData.length) - 2;

    // 背景
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制柱状图
    for (var k = 0; k < dailyData.length; k++) {
      var barH = maxCount > 0 ? (dailyData[k].count / maxCount) * chartH : 0;
      var x = paddingL + (chartW / dailyData.length) * k + 1;
      var y = paddingT + chartH - barH;

      ctx.setFillStyle('#5B8C7E');
      ctx.setGlobalAlpha(0.85);
      ctx.fillRect(x, y, barW > 2 ? barW : 2, barH > 0 ? barH : 1);

      ctx.setGlobalAlpha(1);
    }

    ctx.draw(false, null);

    this.setData({ _maxCount: maxCount, _chartH: chartH, _paddingT: paddingT, _paddingL: paddingL, _barW: barW, _chartW: chartW, _canvasWidth: canvasWidth, _canvasHeight: canvasHeight });
  }
});
