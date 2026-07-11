var request = require('../../../utils/request');
var config = require('../../../utils/config');

Page({
  data: {
    loading: true,
    loadingMore: false,
    noMore: false,
    page: 1,
    pageSize: config.DEFAULT_PAGE_SIZE,

    subjects: [],
    activeSubjectId: '',
    errors: [],

    // 滑动删除状态
    touchStartX: 0,
    activeDeleteId: ''
  },

  onLoad: function () {
    this._loadSubjects();
  },

  onShow: function () {
    // 每次显示时刷新
    if (this.data.activeSubjectId) {
      this.setData({ page: 1, noMore: false });
      this._loadErrors(1);
    }
  },

  onReachBottom: function () {
    if (this.data.loadingMore || this.data.noMore) return;
    this._loadErrors(this.data.page + 1);
  },

  /* 加载科目tabs */
  _loadSubjects: function () {
    var that = this;
    request.callFunction('getExamTypes', {}, { cacheTTL: config.CACHE_TTL.EXAM_TYPES })
      .then(function (res) {
        var examTypes = (res && res.list) || [];
        if (examTypes.length > 0) {
          that._collectSubjects(examTypes, 0, []);
        } else {
          that.setData({ loading: false });
        }
      })
      .catch(function () {
        that.setData({ loading: false });
      });
  },

  _collectSubjects: function (examTypes, idx, collected) {
    var that = this;
    if (idx >= examTypes.length) {
      if (collected.length > 0) {
        that.setData({
          subjects: collected,
          activeSubjectId: collected[0]._id
        });
        that._loadErrors(1);
      } else {
        that.setData({ loading: false });
      }
      return;
    }

    request.callFunction('getSubjects', { examTypeId: examTypes[idx]._id }, { cacheTTL: config.CACHE_TTL.SUBJECTS })
      .then(function (res) {
        var list = (res && res.list) || [];
        collected = collected.concat(list);
        that._collectSubjects(examTypes, idx + 1, collected);
      })
      .catch(function () {
        that._collectSubjects(examTypes, idx + 1, collected);
      });
  },

  /* 切换tab */
  onTabTap: function (e) {
    var id = e.currentTarget.dataset.id;
    if (id === this.data.activeSubjectId) return;
    this.setData({
      activeSubjectId: id,
      page: 1,
      noMore: false
    });
    this._loadErrors(1);
  },

  /* 加载错题 */
  _loadErrors: function (page) {
    var that = this;
    var isFirst = page === 1;

    if (isFirst) this.setData({ loading: true });
    else this.setData({ loadingMore: true });

    request.callFunction('getErrorBook', {
      subjectId: this.data.activeSubjectId,
      page: page,
      pageSize: this.data.pageSize
    })
      .then(function (res) {
        var list = (res && res.list) || [];
        var total = (res && res.total) || 0;

        if (isFirst) {
          that.setData({
            errors: list,
            page: page,
            loading: false,
            noMore: list.length >= total
          });
        } else {
          var prev = that.data.errors;
          that.setData({
            errors: prev.concat(list),
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
  },

  /* 点击题目 */
  onItemTap: function (e) {
    var item = e.currentTarget.dataset.item;
    if (item.questionId) {
      wx.navigateTo({
        url: '/package-questionbank/pages/chapter-practice/chapter-practice?subjectId=' + item.subjectId + '&chapterId=' + (item.chapterId || '') + '&questionId=' + item.questionId
      });
    }
  },

  /* 滑动开始 */
  onTouchStart: function (e) {
    this.setData({ touchStartX: e.touches[0].clientX, activeDeleteId: '' });
  },

  /* 滑动中 */
  onTouchMove: function (e) {
    var delta = e.touches[0].clientX - this.data.touchStartX;
    if (delta < -60) {
      var id = e.currentTarget.dataset.id;
      this.setData({ activeDeleteId: id });
    } else if (delta > 20) {
      this.setData({ activeDeleteId: '' });
    }
  },

  /* 长按移除单条 */
  onLongPress: function (e) {
    var item = e.currentTarget.dataset.item;
    var that = this;
    wx.showModal({
      title: '移除该错题',
      content: '确定从错题本中移除吗？',
      confirmColor: '#D96C6C',
      success: function (modalRes) {
        if (modalRes.confirm) {
          that._removeError(item._id, item.questionId);
        }
      }
    });
  },

  /* 滑动删除按钮 */
  onDeleteItem: function (e) {
    var item = e.currentTarget.dataset.item;
    var that = this;
    wx.showModal({
      title: '移除该错题',
      content: '确定从错题本中移除吗？',
      confirmColor: '#D96C6C',
      success: function (modalRes) {
        if (modalRes.confirm) {
          that._removeError(item._id, item.questionId);
        }
      }
    });
  },

  /* 执行移除 */
  _removeError: function (id, questionId) {
    var that = this;
    request.callFunction('removeError', { errorId: id, questionId: questionId })
      .then(function () {
        var errors = that.data.errors.filter(function (e) { return e._id !== id; });
        that.setData({ errors: errors, activeDeleteId: '' });
        request.showToast('已移除');
      })
      .catch(function () {
        request.showToast('操作失败，请重试');
      });
  },

  /* 清空全部 */
  onClearAll: function () {
    var that = this;
    wx.showModal({
      title: '清空错题本',
      content: '确定清空所有错题吗？此操作不可恢复',
      confirmColor: '#D96C6C',
      success: function (modalRes) {
        if (modalRes.confirm) {
          request.callFunction('clearErrorBook', { subjectId: that.data.activeSubjectId })
            .then(function () {
              that.setData({ errors: [], page: 1, noMore: false });
              request.showToast('错题本已清空');
            })
            .catch(function () {
              request.showToast('操作失败，请重试');
            });
        }
      }
    });
  }
});
