var request = require('../../utils/request');
var config = require('../../utils/config');

Page({
  data: {
    loading: true,
    loadingMore: false,
    noMore: false,
    page: 1,
    pageSize: config.DEFAULT_PAGE_SIZE,
    favorites: []
  },

  onLoad: function () {
    this._loadFavorites(1);
  },

  onReachBottom: function () {
    if (this.data.loadingMore || this.data.noMore) return;
    this._loadFavorites(this.data.page + 1);
  },

  onItemTap: function (e) {
    var item = e.currentTarget.dataset.item;
    // 仅浏览，不跳转
    request.showToast('长按可取消收藏');
  },

  onUnfavorite: function (e) {
    var item = e.currentTarget.dataset.item;
    var that = this;

    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏该题目吗？',
      confirmColor: '#D96C6C',
      success: function (modalRes) {
        if (modalRes.confirm) {
          request.callFunction('toggleFavorite', {
            questionId: item.questionId || item._id,
            isFavorited: false,
            subjectId: item.subjectId || ''
          })
            .then(function () {
              var favorites = that.data.favorites.filter(function (f) {
                return (f.questionId || f._id) !== (item.questionId || item._id);
              });
              that.setData({ favorites: favorites });
              request.showToast('已取消收藏');
            })
            .catch(function () {
              request.showToast('操作失败，请重试');
            });
        }
      }
    });
  },

  _loadFavorites: function (page) {
    var that = this;
    var isFirst = page === 1;

    if (isFirst) this.setData({ loading: true });
    else this.setData({ loadingMore: true });

    request.callFunction('getFavorites', {
      page: page,
      pageSize: this.data.pageSize
    })
      .then(function (res) {
        var list = (res && res.list) || [];
        var total = (res && res.total) || 0;

        if (isFirst) {
          that.setData({
            favorites: list,
            page: page,
            loading: false,
            noMore: list.length >= total
          });
        } else {
          var prev = that.data.favorites;
          that.setData({
            favorites: prev.concat(list),
            page: page,
            loadingMore: false,
            noMore: prev.length + list.length >= total
          });
        }
      })
      .catch(function () {
        if (isFirst) {
          that.setData({ loading: false });
          request.showToast('加载失败，请重试');
        } else {
          that.setData({ loadingMore: false });
          request.showToast('加载失败');
        }
      });
  }
});
