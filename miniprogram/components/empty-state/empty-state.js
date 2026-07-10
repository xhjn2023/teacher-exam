Component({
  properties: {
    icon:     { type: String,  value: '' },
    title:    { type: String,  value: '' },
    subtitle: { type: String,  value: '' },
    showBtn:  { type: Boolean, value: false },
    btnText:  { type: String,  value: '去看看' }
  },

  methods: {
    onAction: function () {
      this.triggerEvent('action');
    }
  }
});
