/**
 * 虚拟滚动工具
 * 只渲染可见区域的题目卡片，减少 setData 数据量和渲染节点数
 *
 * 用法:
 *   var VirtualScroll = require('../../utils/virtual-scroll');
 *   this._vs = new VirtualScroll({
 *     container: '.scroll-wrap',
 *     itemMinHeight: 400,      // rpx
 *     buffer: 2,               // 上下缓冲项数
 *     onDataChange: function(state) { self.setData(state); }
 *   });
 */

function VirtualScroll(options) {
  var opts = options || {};

  this._container = opts.container || '.scroll-wrap';
  this._itemMinHeight = opts.itemMinHeight || 400;
  this._buffer = opts.buffer || 2;
  this._onDataChange = opts.onDataChange || null;

  this._items = [];           // 全部题目
  this._containerHeight = 0;  // 滚动容器高度（px）
  this._scrollTop = 0;        // 当前滚动位置

  // 系统信息缓存
  this._sysInfo = wx.getSystemInfoSync();
  this._rpxRatio = this._sysInfo.windowWidth / 750;
}

VirtualScroll.prototype = {
  /**
   * 更新全部数据，重新计算渲染区域
   */
  updateItems: function (items) {
    this._items = items || [];
    this._recalc();
  },

  /**
   * 追加数据（适用于触底加载更多）
   */
  appendItems: function (newItems) {
    if (!newItems || !newItems.length) return;
    this._items = this._items.concat(newItems);
    this._recalc();
  },

  /**
   * 更新滚动位置（通常在 scroll-view 的 bindscroll 中调用）
   */
  onScroll: function (e) {
    this._scrollTop = e.detail.scrollTop;
    this._recalc();
  },

  /**
   * 重新计算滚动容器高度
   */
  _measureContainer: function () {
    var self = this;
    var query = wx.createSelectorQuery();
    query.select(this._container).boundingClientRect();
    query.exec(function (res) {
      if (res && res[0]) {
        self._containerHeight = res[0].height;
        self._recalc();
      }
    });
  },

  /**
   * 核心计算：根据 scrollTop 和每项高度，计算可见区域
   */
  _recalc: function () {
    if (!this._items.length) {
      this._emit(0, 0, 0, 0, []);
      return;
    }

    var totalCount = this._items.length;
    var itemPx = this._itemMinHeight * this._rpxRatio;

    // 总高度
    var totalHeight = totalCount * itemPx;

    // 可见起始索引
    var startIndex = Math.floor(this._scrollTop / itemPx);

    // 减去缓冲
    startIndex = Math.max(0, startIndex - this._buffer);

    // 可见项数 = 容器高度 / 每项高度 + 上下缓冲
    var visibleCount = Math.ceil(this._containerHeight / itemPx) + this._buffer * 2;

    // 结束索引
    var endIndex = Math.min(totalCount, startIndex + visibleCount);

    // 实际可见项数可能超出，重新计算 startIndex
    if (endIndex - startIndex < visibleCount && startIndex > 0) {
      startIndex = Math.max(0, endIndex - visibleCount);
    }

    var visibleItems = this._items.slice(startIndex, endIndex);

    // 偏移量 = startIndex * 每项高度
    var offsetY = startIndex * itemPx;

    this._emit(startIndex, totalCount, totalHeight, offsetY, visibleItems);
  },

  _emit: function (startIndex, totalCount, totalHeight, offsetY, visibleItems) {
    if (typeof this._onDataChange === 'function') {
      this._onDataChange({
        startIndex: startIndex,
        total: totalCount,
        totalHeight: totalHeight,
        offsetY: offsetY,
        visibleQuestions: visibleItems
      });
    }
  },

  /**
   * 页面 onReady 中调用，初始化容器尺寸
   */
  ready: function () {
    this._measureContainer();
  },

  /**
   * 销毁
   */
  destroy: function () {
    this._items = [];
    this._onDataChange = null;
  }
};

module.exports = VirtualScroll;
