var request = require('../../utils/request');
var config = require('../../utils/config');

Page({
  data: {
    loading: true,
    subjects: [],
    subjectIndex: 0,
    selectedSubjectId: '',
    questionCount: config.MOCK_EXAM_DEFAULTS.TOTAL_COUNT || 100,
    countRange: { min: 20, max: 200, step: 10 }
  },

  onLoad: function () {
    var that = this;
    request.callFunction('getExamTypes', {}, { cacheTTL: config.CACHE_TTL.EXAM_TYPES })
      .then(function (res) {
        var examTypes = (res && res.list) || [];
        if (examTypes.length > 0) {
          that._loadSubjectsByExamType(examTypes, 0);
        } else {
          that.setData({ loading: false });
        }
      })
      .catch(function () {
        that.setData({ loading: false });
        request.showToast('加载失败，请重试');
      });
  },

  _loadSubjectsByExamType: function (examTypes, examIdx) {
    var that = this;
    if (examIdx >= examTypes.length) {
      that.setData({ loading: false });
      return;
    }

    var examType = examTypes[examIdx];
    request.callFunction('getSubjects', { examTypeId: examType._id }, { cacheTTL: config.CACHE_TTL.SUBJECTS })
      .then(function (res) {
        var list = (res && res.list) || [];
        var subjects = that.data.subjects.concat(list.map(function (s) {
          s._examName = examType.name;
          return s;
        }));
        that.setData({ subjects: subjects });

        if (subjects.length > 0 && !that.data.selectedSubjectId) {
          that.setData({
            selectedSubjectId: subjects[0]._id,
            subjectIndex: 0,
            loading: false
          });
        } else if (examIdx + 1 < examTypes.length) {
          that._loadSubjectsByExamType(examTypes, examIdx + 1);
        } else {
          that.setData({ loading: false });
        }
      })
      .catch(function () {
        if (examIdx + 1 < examTypes.length) {
          that._loadSubjectsByExamType(examTypes, examIdx + 1);
        } else {
          that.setData({ loading: false });
        }
      });
  },

  onSubjectChange: function (e) {
    var idx = parseInt(e.detail.value, 10);
    var subject = this.data.subjects[idx];
    this.setData({
      subjectIndex: idx,
      selectedSubjectId: subject ? subject._id : ''
    });
  },

  onSliderChange: function (e) {
    this.setData({ questionCount: e.detail.value });
  },

  onStartExam: function () {
    if (!this.data.selectedSubjectId) {
      request.showToast('请先选择科目');
      return;
    }
    if (!this.data.questionCount || this.data.questionCount < 1) {
      request.showToast('请设置题目数量');
      return;
    }

    wx.navigateTo({
      url: '/package-exam/pages/mock-exam/mock-exam?subjectId=' + this.data.selectedSubjectId + '&questionCount=' + this.data.questionCount
    });
  }
});
