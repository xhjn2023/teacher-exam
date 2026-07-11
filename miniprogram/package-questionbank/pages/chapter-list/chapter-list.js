var request = require('../../../utils/request');
var config = require('../../../utils/config');

Page({
  data: {
    subjectId: '',
    title: '',
    loading: true,
    chapters: [],
    showTypePicker: false,
    typeList: [
      { value: 'single', label: '单选题' },
      { value: 'multi', label: '多选题' },
      { value: 'judge', label: '判断题' },
      { value: 'fill', label: '填空题' },
      { value: 'essay', label: '简答题' }
    ]
  },

  onLoad: function (options) {
    var subjectId = options.subjectId || '';
    var title = decodeURIComponent(options.title || '章节列表');

    wx.setNavigationBarTitle({ title: title });

    this.setData({
      subjectId: subjectId,
      title: title
    });

    var that = this;
    request.callFunction('getChapters', { subjectId: subjectId }, { cacheTTL: config.CACHE_TTL.CHAPTERS })
      .then(function (res) {
        that.setData({
          chapters: (res && res.list) || [],
          loading: false
        });
      })
      .catch(function () {
        that.setData({ loading: false });
        request.showToast('加载失败，请重试');
      });
  },

  onChapterTap: function (e) {
    var item = e.currentTarget.dataset.item;
    if (item.type === 'real-paper') {
      wx.navigateTo({
        url: '/package-questionbank/pages/real-paper-list/real-paper-list?subjectId=' + this.data.subjectId + '&title=' + encodeURIComponent(item.name)
      });
    } else {
      wx.navigateTo({
        url: '/package-questionbank/pages/chapter-practice/chapter-practice?subjectId=' + this.data.subjectId + '&chapterId=' + item._id + '&chapterTitle=' + encodeURIComponent(item.name)
      });
    }
  },

  // 随机练习本科目(不限章节)
  onRandomPractice: function () {
    wx.navigateTo({
      url: '/package-questionbank/pages/chapter-practice/chapter-practice?subjectId=' + this.data.subjectId + '&chapterId=&chapterTitle=' + encodeURIComponent(this.data.title + '·随机练习') + '&random=1'
    });
  },

  // 打开题型选择
  onShowTypePicker: function () {
    this.setData({ showTypePicker: true });
  },

  onHideTypePicker: function () {
    this.setData({ showTypePicker: false });
  },

  // 按题型练习
  onTypePractice: function (e) {
    var typeItem = e.currentTarget.dataset.item;
    this.setData({ showTypePicker: false });
    wx.navigateTo({
      url: '/package-questionbank/pages/chapter-practice/chapter-practice?subjectId=' + this.data.subjectId + '&chapterId=&chapterTitle=' + encodeURIComponent(this.data.title + '·' + typeItem.label) + '&type=' + typeItem.value
    });
  }
});
