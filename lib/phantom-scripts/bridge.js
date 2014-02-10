/*jslint indent: 2*/
/*globals document: false, phantom: false, handleArgs: false*/
var port = phantom.args[1],
  scriptName = phantom.args[0],
  controlPage = require("webpage").create();

// TODO: figure out how to work phantom's module system
// and use that
phantom.injectJs(scriptName + ".js");

controlPage.onAlert = function (msg) {
  "use strict";
  var args;

  if (msg === "exit") {
    phantom.exit();
  }

  args = JSON.parse(msg);

  handleArgs(args, function (err, response) {
    if (err) {
      throw new Error(err);
    }

    controlPage.evaluate('function(){socket.emit("output",'
      + JSON.stringify(response)
      + ');}');
  });
};

controlPage.open('http://127.0.0.1:' + port + '/');
