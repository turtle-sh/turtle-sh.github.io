define({
  "name": "ace",
  "tagLine": "Text editor",
  "description": "Text editor",
  "fn": function(message) {

    // Set up the html
    this.$el.html('<div class="fill ace"></div>');
    this.$el.addClass('fill');

    // Define a good exit fn
    this._exit = this.exit;
    this.exit = function() {
      this.$el.find('.ace').remove();
      this.$el.removeClass('fill');
      delete this.editor;
      this._exit();
    }.bind(this);

    // Initialize ace
    var aceEl = this.$el.find('.ace')[0];
    aceEl.focus();
    this.editor = ace.edit(aceEl);
    this.editor.setTheme("ace/theme/monokai");
    this.editor.getSession().setMode("ace/mode/javascript");

    this.editor.commands.addCommand({
      name: 'exit',
      bindKey: {
        mac: 'command-c'
      },
      exec: function(editor) {
        this.exit();
      }.bind(this)
    });

    this.editor.focus();
    return false;
  },
  "keys": {
    "ctrl+c": function() {
      this.exit();
    },
    "p": function() {
      console.log('laaa');
      this.exit();
    }
  }
});
