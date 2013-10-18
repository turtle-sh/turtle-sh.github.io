Process = function(conf) {
  this.init.apply(this,arguments);
};

_.extend(Process.prototype, Backbone.Events);

Process.prototype.init = function(conf) {
  _.extend(this, conf, Backbone.Events);

  this.ps1 = "<span class='ps'>$</span>";

  this.storage = new Storage();

  this._cwd = '';

  this.stdout = new Stdout();
  this.stdin = new Stdin();

};

Process.prototype.spawn = function() {
  var p = new Process();
  p.cwd = this.cwd.bind(this);
  p.chdir = this.chdir.bind(this);

  // Create el, attach.
  p.$el =$("<div class='process'></div>").appendTo(this.$el);

  p.fs = this.fs.bind(this);
  p.stdout.pipe(this.stdin);
  p.exit = this.exit;
  return p;
};

Process.prototype.cwd = function() {
  return this._cwd;
};

Process.prototype.chdir = function(dir) {
  return this._cwd = dir;
};


Process.prototype.commands = [];


Process.prototype.exec = function(command, noSpawn) {
  var p;
  if(noSpawn) {
    p = this;
  } else {
    p = this.spawn();
  }

  // Give the process something to exit
  p.exit = function(e) {
    if(e) {
      p.stdout.err(e);
    }
    p.$el.remove();
  }.bind(this);

  // Search for and initiate the process
  found = _(this.commands).some(function(commandObj) {
    if (commandObj.expr.test(command) ) {
      try {
        commandObj.fn.call(p, command.split(' '));
      } catch(e) {
        window.e = e;
        p.stdout.err(e)
        p.exit();
      }
      return true;
    }
  }, this);

  // Or go back
  if(!found) {
    this.stdout.log("turtle: " + command + ": command not found")
    p.exit();
  }
};


Process.prototype.addCommand = function(commandObj) {
  try {
  if(_(commandObj).isArray()) {
    var addCommand = this.addCommand || this.prototype.addCommand;

    return _(commandObj).each(addCommand, this);
  }
  // Can be treated as static.
  var commandsArray = ('commands' in this) ? this.commands : this.prototype.commands;
  if (typeof commandObj.fn !== 'function') 
    throw "commandObj.fn must be a function.";
  if (typeof commandObj.expr !== 'object' && commandObj.expr.test) 
    throw "commandObj.fn must be a RegExp.";

  commandsArray.push(commandObj);
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
