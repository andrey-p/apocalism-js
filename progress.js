/*jslint indent: 2, node: true*/
"use strict";

var options = require("./options.js"),
  action;

exports.start = function (a) {
  if (options.quiet) {
    return;
  }

  action = a;

  process.stdout.write(action + "...\r");
};

exports.update = function (value) {
  if (options.quiet || !action) {
    return;
  }

  process.stdout.write(action + "... " + value + "                  \r");
};

exports.end = function () {
  if (options.quiet || !action) {
    return;
  }

  process.stdout.write(action + "... done!                    \n");
  action = null;
};

exports.message = function (msg) {
  if (options.quiet) {
    return;
  }

  process.stdout.write(msg + "\n");
};
