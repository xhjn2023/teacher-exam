Component({
  properties: {
    visible:      { type: Boolean, value: false },
    total:        { type: Number,  value: 0 },
    answers:      { type: Array,   value: [] },
    currentIndex: { type: Number,  value: 0 }
  },

  methods: {
    onJump: function (e) {
      var index = e.currentTarget.dataset.index;
      this.triggerEvent('jump', { index: index });
    },

    onClose: function () {
      this.triggerEvent('close');
    },

    onSubmit: function () {
      this.triggerEvent('submit');
    }
  }
});
