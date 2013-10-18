Turtle = function(conf) {
  this.init.apply(this,arguments);
};

// Turtle and Process share commands.
Turtle.prototype.commands = Process.prototype.commands;

Turtle.prototype.init = function(conf) {
  _.extend(this, conf, Backbone.Events);

  this.ps1 = "<span class='ps'>$</span>";

  this.render();

  this.storage = new Storage();

  this._cwd = '';

  $.getJSON('manifest.json', function(manifest) {
    this.manifest = manifest;
    this.exec('echo turtle v' + this.manifest.version);
    this.trigger('ready');
  }.bind(this));

};

Turtle.prototype.cwd = function() {
  return this._cwd;
};

Turtle.prototype.chdir = function(dir) {
  return this._cwd = dir;
};

Turtle.prototype.render = function() {
  this.$el.html(this.template());
  var $el = this.$el.find('.output');
  // Establish stdout
  this.stdout = new Stdout();
  this.stdout.write = function(message) {
    messageArr = message.toString().split('\n');
    if(!$el.children().length) {
      $el.append('<p></p>');
    }
    var nextLine = messageArr.shift();
    $el.children().last().append(nextLine);
    while(messageArr.length) {
      nextLine = messageArr.shift();
      $el.append('<p></p>')
      $el.children().last().append(nextLine);
    }
  }.bind(this);
  this.stdout.clear = function() {
    this.$el.find('.output').empty();
  }.bind(this);
  this.stdin = new Stdin();
  // Enter
  this.inputEl = this.$el.find('form.command input');
  this.$el.find('form.command').submit( function(e) {
    e.preventDefault();
    var val = this.inputEl.val();
    this.inputEl.val('');
    this.stdout.log(this.ps1 + val);
    this.exec(val);
  }.bind(this) );
};


Turtle.prototype.template = function() {
  return '<div class="output"></div><form class="command">' + this.ps1 + '<input type="text" /></form>';
};


Turtle.prototype.fs = function(val) {
  if(val) {
    this._fs = val;
  } else {
    if(this._fs) return this._fs;
    this._fs = require('fs');
    return this._fs;
  }
};

/* This deserves some thought. Obviously should be broken out into a separate command, yet needs access to raw command objects. */
Turtle.prototype.whatis = function(command) {
  // Remove that first whatis and avoid possible spinning here
  command = command.replace(/whatis ?/g,'');

  found = _(this.commands).some(function(commandObj) {
    if (commandObj.name === command || (commandObj.expr && commandObj.expr.test(command) ) ) {
      if(commandObj.tagLine) this.exec('echo ' + commandObj.name + '\t- ' + commandObj.tagLine);
    }
  }, this);
};

/* This deserves some thought. Obviously should be broken out into a separate command, yet needs access to raw command objects. */
Turtle.prototype.man = function(command) {
  // Remove that first whatis and avoid possible spinning here
  command = command.replace(/man ?/g,'');

  found = _(this.commands).some(function(commandObj) {
    if (commandObj.name === command || (commandObj.expr && commandObj.expr.test(command) ) ) {
      if(commandObj.tagLine) this.exec('echo ' + commandObj.name + '\t- ' + commandObj.tagLine);
    }
  }, this);
};

Turtle.prototype.exec = function(command) {
  var commandName = command.split(' ')[0];
  switch(commandName) {
    case 'whatis':
      return this.whatis(command);
      break;
    default:
      break;
  }
  var p = new Process();
  p.stdout.pipe(this.stdout);
  p.$el = $("<div class='process'></div>").appendTo(this.$el);
  p.cwd = this.cwd.bind(this);
  p.chdir = this.chdir.bind(this);
  p.fs = this.fs.bind(this);



  // Search for and initiate the process
  found = _(this.commands).some(function(commandObj) {
    if (commandObj.name === commandName || (commandObj.expr && commandObj.expr.test(command) ) ) {
      try {

        // Give the process something to exit
        p.exit = function(e) {
          if(commandObj.keys) {
            _(commandObj.keys).each(function(fn, k) {
              key.unbind(k, JSON.stringify(commandObj.description));
            });
          }
          if(e) {
            p.stdout.err(e);
          }
          p.$el.remove();
          this.$el.find('form.command').show();
          this.$el.find('form.command input')
            .focus();
          this.$el.scrollTop(this.inputEl.position().top);
          
        }.bind(this);

        // Go into process-mode
        this.$el.find('form.command').hide();

        var arg = command;
        if(commandObj.parse) {
          arg = commandObj.parse(arg);
        }
        if(commandObj.keys) {
          _(commandObj.keys).each(function(fn, k) {
            key(k, JSON.stringify(commandObj.description), fn.bind(p));
          });
        }
        key.setScope(JSON.stringify(commandObj.description) );
        commandObj.fn.call(p, arg);
      } catch(e) {
        window.e = e;
        p.stdout.err(e);
        p.exit();
      }
      return true;
    }
  }, this);

  // Or go back
  if(!found) {
    this.stdout.log("turtle: " + command + ": command not found");
    p.exit();
  }
};


Turtle.prototype.addCommand = function(commandObj) {
  try {
  if(_(commandObj).isArray()) {
    var addCommand = this.addCommand || this.prototype.addCommand;

    return _(commandObj).each(addCommand, this);
  }

  if (typeof commandObj.fn !== 'function') 
    throw "commandObj.fn must be a function.";

    this.prototype.commands.push(commandObj);
  } catch(e) {}
};


/* pipe thoughts
 *
 * wc.stdout.pipe(this.stdout);
 * cat.stdout.pipe(wc.stdin);
 *
 * wc
 * var text = [];
 * this.stdin.on('data', function(data) {
 *   text = text.concat(data);
 * });
 * this.stdin.on('end', function() {
 *    this.stdout.log(text.length);
 *    this.exit()
 * }.bind(this));
 *
 * So: 
 *  - objects need to have their own stdin, stdout
 *  - Yet continue to have access to things like exit() and el() and editor()
 *
 */

/* prompt
 *
 * prompt('subject');
 * prompt({
 *  name: 'subject',
 *  message: 'What's the subject of your email?',
 *  required: true
 * });
 *
 * prompt.subject
 *
 */

/* package
 *
 * install ls
 *
 * https://turtle.sh/package/ls
 *
 * 200: 
 *  https://github.com/itsjoesullivan/ls/blob/master/index.js
 *  curl index.js
 *  storage.set('package/ls', ls);
 *  packages.add('ls');
 *
 */
