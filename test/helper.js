/*jslint indent: 2, node: true*/
"use strict";

var exec = require("child_process").exec;

// returns true if process exists
exports.checkIfProcessExists = function (processName, callback) {
  exec("pgrep " + processName, function (error, stdout, stderr) {
    // error code 1 means no matches
    if (error && error.code !== 1) {
      callback(error);
    } if (stderr) {
      callback(stderr);
    } else {
      callback(null, !!stdout.length);
    }
  });
};

// output mimetype of file
exports.getFileMimeType = function (path, callback) {
  exec("file -b --mime-type " + path, function (error, stdout, stderr) {
    if (error) {
      callback(error);
    } if (stderr) {
      callback(stderr);
    } else {
      callback(null, stdout);
    }
  });
};
