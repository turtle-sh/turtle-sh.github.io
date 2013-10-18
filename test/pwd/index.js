define({
  name: 'test-pwd',
  fn: function() {
    this.chdir('abc');
    if(this.cwd() !== 'abc') {
      throw "this.chdir not setting wd";
    }
    var p =this.spawn();
    p.chdir('/');
    if(this.cwd() !== '/') {
      throw "child process cwd not setting this wd";
    }
    this.exit();
  }
});
