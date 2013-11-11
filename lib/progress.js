/*jslint indent: 2, node: true*/
"use strict";

var action, quiet;

exports.start = function (a) {
  if (quiet) {
    return;
  }

  action = a;

  process.stdout.write(action + "...\r");
};

exports.update = function (value) {
  if (quiet || !action) {
    return;
  }

  process.stdout.write(action + "... " + value + "                  \r");
};

exports.end = function () {
  if (quiet || !action) {
    return;
  }

  process.stdout.write(action + "... done!                    \n");
  action = null;
};

exports.message = function (msg) {
  if (quiet) {
    return;
  }

  process.stdout.write(msg + "\n");
};

exports.init = function (options, callback) {
  quiet = options.quiet;
  callback();
};
