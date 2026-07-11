var request = require('../../../utils/request');

Page({
  data: {
    loading: true,
    todayChecked: false,
    streak: 0,
    points: 0,
    recentDates: [],
    rules: {},
    // 本月日历
    calendarDays: [],
    year: 0,
    month: 0,
    monthLabel: ''
  },

  onLoad: function () {
    this._buildCalendar();
    this._loadStatus();
  },

  // 构建本月日历
  _buildCalendar: function () {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var today = now.getDate();
    var firstDay = new Date(year, month, 1).getDay(); // 本月1号是周几
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var padMonth = String(month + 1).padStart(2, '0');

    var days = [];
    // 前置空白
    for (var i = 0; i < firstDay; i++) {
      days.push({ empty: true });
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = year + '-' + padMonth + '-' + String(d).padStart(2, '0');
      days.push({
        day: d,
        dateStr: dateStr,
        isToday: d === today,
        checked: false // 后续根据 recentDates 标记
      });
    }

    this.setData({
      calendarDays: days,
      year: year,
      month: month + 1,
      monthLabel: year + '年' + (month + 1) + '月'
    });
  },

  // 标记已签到日期
  _markChecked: function (recentDates) {
    var checkedSet = {};
    recentDates.forEach(function (d) { checkedSet[d] = true; });
    var days = this.data.calendarDays.map(function (item) {
      if (item.dateStr) item.checked = !!checkedSet[item.dateStr];
      return item;
    });
    this.setData({ calendarDays: days });
  },

  _loadStatus: function () {
    var that = this;
    request.callFunction('checkin', { action: 'status' }, { cacheTTL: 0, forceRefresh: true })
      .then(function (res) {
        if (res && res.code === 0) {
          that.setData({
            todayChecked: res.todayChecked,
            streak: res.streak,
            points: res.points,
            recentDates: res.recentDates || [],
            rules: res.rules || {},
            loading: false
          });
          that._markChecked(res.recentDates || []);
        } else {
          that.setData({ loading: false });
        }
      })
      .catch(function () {
        that.setData({ loading: false });
        request.showToast('加载失败，请重试');
      });
  },

  // 执行签到
  onCheckin: function () {
    var that = this;
    if (this.data.todayChecked) return;

    wx.showLoading({ title: '签到中...', mask: true });
    request.callFunction('checkin', { action: 'checkin' }, { cacheTTL: 0, forceRefresh: true })
      .then(function (res) {
        wx.hideLoading();
        if (res && res.code === 0) {
          that.setData({
            todayChecked: true,
            streak: res.streak,
            points: res.points
          });
          that._markChecked([].concat(that.data.recentDates, [that._todayStr()]));
          wx.showToast({ title: '+' + res.gained + '积分', icon: 'none', duration: 2000 });
        } else {
          wx.showToast({ title: (res && res.msg) || '签到失败', icon: 'none' });
        }
      })
      .catch(function () {
        wx.hideLoading();
        wx.showToast({ title: '签到失败，请重试', icon: 'none' });
      });
  },

  _todayStr: function () {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
});
