Component({
  properties: {
    question: { type: String, value: '' },
    answer:   { type: String, value: '' }
  },

  data: {
    flipped: false
  },

  methods: {
    onFlip: function () {
      this.setData({ flipped: !this.data.flipped });
    }
  }
});
