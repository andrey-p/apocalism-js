"use strict";

var action;

exports.start = function (a) {
  action = a;

  process.stdout.write(action + "...\r");
};

exports.update = function (value) {
  if (!action) {
    return;
  }

  process.stdout.write(action + "... " + value + "                  \r");
};

exports.end = function () {
  if (!action) {
    return;
  }

  process.stdout.write(action + "... done!                    \n");
  action = null;
};

exports.message = function (msg) {
  process.stdout.write(msg + "\n");
};
