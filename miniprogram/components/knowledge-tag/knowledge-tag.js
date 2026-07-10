Component({
  properties: {
    name:   { type: String, value: '' },
    detail: { type: String, value: '' }
  },

  data: {
    expanded: false
  },

  methods: {
    onToggle: function () {
      this.setData({ expanded: !this.data.expanded });
    }
  }
});
