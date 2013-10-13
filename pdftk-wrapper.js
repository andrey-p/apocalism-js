/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var exec = require("child_process").exec,
  os = require("os");

exports.concatenatePages = function (pagePaths, callback) {
  var pathsArg = pagePaths.join(" "),
    outputPath = os.tmpDir() + "/apoc_output_full" + Date.now() + ".pdf";

  exec("pdftk " + pathsArg + " cat output " + outputPath, function (err, stdout, stderr) {
    if (err) {
      callback(err + ": " + stderr);
      return;
    }

    callback(null, outputPath);
  });
};
