Component({
  properties: {
    remaining: { type: Number, value: 0 }
  },

  data: {
    displayTime: '00:00',
    urgencyClass: ''
  },

  observers: {
    'remaining': function (val) {
      var sec = Math.max(0, Math.floor(val));
      var m = Math.floor(sec / 60);
      var s = sec % 60;
      var mm = m < 10 ? '0' + m : '' + m;
      var ss = s < 10 ? '0' + s : '' + s;
      var cls = '';
      if (sec < 60) {
        cls = 'danger';
      } else if (sec < 300) {
        cls = 'warning';
      }
      this.setData({ displayTime: mm + ':' + ss, urgencyClass: cls });
    }
  }
});
