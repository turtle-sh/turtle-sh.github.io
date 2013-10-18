var random = Math.random();

define({
  name: 'qwer',
  fn: function(arg) {
    if(arg !== random) {
      throw "parse isn't called.";
    } else {
      this.stdout.write('+');
    }
    this.exit();
  },
  parse: function(arg) {
    return random;
  }
});
