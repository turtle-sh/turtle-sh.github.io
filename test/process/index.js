define({
  name: 'test-$el',
  fn: function() {
    if(!this.$el) {
      throw "No $el";
    }
    var p = this.spawn();
    if(this.$el.find(".process").length !== 1) {
      throw "Child process el doesn't seem to exist.";
    }
    this.exit();
  }
});
