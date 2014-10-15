"use strict";

var exec = require("child_process").exec,
  os = require("os");

exports.concatenatePages = function (outputPath, pagePaths, callback) {
  var pathsArg = pagePaths.join(" ");

  /*jslint unparam: true*/
  exec("pdftk " + pathsArg + " cat output " + outputPath, function (err, stdout, stderr) {
    if (err) { return callback(err + ": " + stderr); }

    callback(null, outputPath);
  });
  /*jslint unparam: false*/
};
