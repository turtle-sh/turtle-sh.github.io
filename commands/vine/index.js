define({
  "expr": /^vine (.*)$/,
  "fn": function(id) {
    id = id[1];
    $.ajax({ url: "https://vine.co/v/" + id + "/embed/simple"})
      .done(function(data) {
        var lines = data.split('\n');
        var videoLine = _(lines).filter(function(line) { return /<source/.test(line); } );
        var video = $("<video style='width: 100%;'>" + videoLine + "</video>");
        this.stdout.el.html('<div class="vine"></div>');
        this.stdout.el.find('.vine').append(video);
        var video = this.stdout.el.find('.vine video')[0]
        video.addEventListener('ended', function() {
          video.play();
        });
        video.play();
      }.bind(this) )
      .fail(function() {
        this.stdout.log("vine error: id not found. Try bXZre5gtYgT instead!")
        this.exit();
      }.bind(this) );

      var close;
      var _exit = this.exit.bind(this);
      this.exit = function() {
        this.stdout.el.find('.vine').remove();
        key.unbind('ctrl+c');
        key.unbind('esc');
        _exit();
      }.bind(this);
      close = this.exit;
      key('ctrl+c', close);
      key('esc', close);
    return false;
  }
});
