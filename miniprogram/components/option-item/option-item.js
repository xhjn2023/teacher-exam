Component({
  properties: {
    label:    { type: String, value: '' },
    text:     { type: String, value: '' },
    selected: { type: Boolean, value: false },
    correct:  { type: Boolean, value: false },
    wrong:    { type: Boolean, value: false }
  },

  methods: {
    onTap: function () {
      this.triggerEvent('tap', { label: this.data.label });
    }
  }
});
