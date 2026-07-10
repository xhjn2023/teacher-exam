/**
 * 全局计时器管理
 * 支持倒计时和正计时两种模式
 */

/**
 * 创建倒计时器
 * @param {number} totalSeconds 总秒数
 * @param {Function} onTick 每秒回调(remainingSeconds)
 * @param {Function} onEnd 计时结束回调
 * @returns {object} {start, pause, resume, stop, isRunning}
 */
function createCountdown(totalSeconds, onTick, onEnd) {
  var remaining = totalSeconds;
  var timerId = null;
  var running = false;

  function tick() {
    remaining--;
    if (typeof onTick === 'function') onTick(remaining);
    if (remaining <= 0) {
      stop();
      if (typeof onEnd === 'function') onEnd();
      return;
    }
    timerId = setTimeout(tick, 1000);
  }

  function start() {
    if (running) return;
    running = true;
    remaining = totalSeconds;
    if (typeof onTick === 'function') onTick(remaining);
    timerId = setTimeout(tick, 1000);
  }

  function pause() {
    if (!running) return;
    running = false;
    if (timerId) { clearTimeout(timerId); timerId = null; }
  }

  function resume() {
    if (running || remaining <= 0) return;
    running = true;
    if (typeof onTick === 'function') onTick(remaining);
    timerId = setTimeout(tick, 1000);
  }

  function stop() {
    running = false;
    if (timerId) { clearTimeout(timerId); timerId = null; }
  }

  return {
    start: start,
    pause: pause,
    resume: resume,
    stop: stop,
    getRemaining: function () { return remaining; },
    isRunning: function () { return running; }
  };
}

/**
 * 单题答题计时（正计时，用于章节练习）
 * 返回 elapsed 秒数
 */
function createElapsedTimer(onTick) {
  var elapsed = 0;
  var timerId = null;

  function tick() {
    elapsed++;
    if (typeof onTick === 'function') onTick(elapsed);
    timerId = setTimeout(tick, 1000);
  }

  function start() {
    if (timerId) return;
    elapsed = 0;
    if (typeof onTick === 'function') onTick(elapsed);
    timerId = setTimeout(tick, 1000);
  }

  function stop() {
    if (timerId) { clearTimeout(timerId); timerId = null; }
    return elapsed;
  }

  return { start: start, stop: stop, getElapsed: function () { return elapsed; } };
}

module.exports = {
  createCountdown: createCountdown,
  createElapsedTimer: createElapsedTimer
};
