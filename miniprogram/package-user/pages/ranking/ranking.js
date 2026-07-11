var request = require('../../../utils/request');

Page({
  data: {
    loading: true,
    activeTab: 'points', // points | total | streak
    rawList: [],   // 云端原始数据（按积分降序）
    displayList: [], // 当前 tab 对应的排序列表
    myPoints: 0,
    myStreak: 0,
    myTotalCount: 0,
    myRank: 0
  },

  onLoad: function () {
    this._loadMyData();
    this._loadRanking();
  },

  // 读取本地学习数据，展示"我的排名"区块
  _loadMyData: function () {
    var app = getApp();
    var study = (app && app.globalData && app.globalData.studyData) || {};
    this.setData({
      myPoints: study.points || 0,
      myStreak: study.streak || 0,
      myTotalCount: study.totalCount || 0
    });
  },

  _loadRanking: function () {
    var that = this;
    request.callFunction('getRanking', {}, { cacheTTL: 60, forceRefresh: true })
      .then(function (res) {
        if (res && res.code === 0) {
          var list = res.list || [];
          that.setData({
            rawList: list,
            loading: false
          });
          that._updateDisplay();
          that._calcMyRank(list);
        } else {
          that.setData({ loading: false });
        }
      })
      .catch(function () {
        that.setData({ loading: false });
        request.showToast('加载失败，请重试');
      });
  },

  // 根据当前 tab 生成展示列表（前端对同一份数据排序）
  _updateDisplay: function () {
    var tab = this.data.activeTab;
    var list = this.data.rawList.slice();
    if (tab === 'total') {
      list.sort(function (a, b) { return (b.totalCount || 0) - (a.totalCount || 0); });
    } else if (tab === 'streak') {
      list.sort(function (a, b) { return (b.streak || 0) - (a.streak || 0); });
    }
    // points 已是云端排好序，无需重排
    var display = list.map(function (item, index) {
      return {
        userId: item.userId,
        nickName: item.nickName,
        avatarUrl: item.avatarUrl,
        points: item.points,
        totalCount: item.totalCount,
        streak: item.streak,
        rank: index + 1
      };
    });
    this.setData({ displayList: display });
  },

  // 根据积分估算当前用户排名（比当前用户积分高的人数 + 1）
  _calcMyRank: function (list) {
    var myPoints = this.data.myPoints;
    if (!list.length || myPoints <= 0) {
      this.setData({ myRank: 0 });
      return;
    }
    var higher = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].points > myPoints) higher++;
    }
    this.setData({ myRank: higher + 1 });
  },

  // 切换 Tab
  onTabChange: function (e) {
    var tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab });
    this._updateDisplay();
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    this._loadMyData();
    request.callFunction('getRanking', {}, { cacheTTL: 0, forceRefresh: true })
      .then(function (res) {
        wx.stopPullDownRefresh();
        if (res && res.code === 0) {
          var list = res.list || [];
          that.setData({ rawList: list });
          that._updateDisplay();
          that._calcMyRank(list);
        }
      })
      .catch(function () {
        wx.stopPullDownRefresh();
      });
  }
});
