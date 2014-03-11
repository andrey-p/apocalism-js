/*globals document: false, phantom: false*/
var port = phantom.args[1],
  scriptName = phantom.args[0],
  controlPage = require("webpage").create(),
  system = require("system"),
  scriptModule = require("./" + scriptName);

/*
 * This uses a websockets method heavily borrowed from Alex Scheel Meyer's node-phantom
 * https://github.com/alexscheelmeyer/node-phantom
 */

controlPage.onAlert = function (msg) {
  "use strict";
  var args;

  if (msg === "exit") {
    phantom.exit();
  }

  args = JSON.parse(msg);

  scriptModule.handleArgs(args, function (err, response) {
    if (err) {
      return system.stderr.writeLine(err);
    }

    controlPage.evaluate('function(){socket.emit("output",'
      + JSON.stringify(response)
      + ');}');
  });
};

controlPage.open('http://127.0.0.1:' + port + '/');
