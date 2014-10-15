"use strict";

var utils = require("./utils"),
  quiet = true;

// this is a logger that:
//
// - takes a message and outputs it
// - can be plugged into an async waterfall method very easily
// (i.e. takes a callback method as the last argument
// and calls it with all the other params)
// - stays quiet unless specifically passed a quiet: false option
// to avoid accidental output during e.g. tests
exports.log = function () {
  var args = Array.prototype.slice.call(arguments),
    msg = args.shift(),
    callback;

  console.log(msg);

  if (typeof args[args.length - 1] === "function") {
    // null error so we can slide down the waterfall nicely
    args.unshift(null);

    // nextTick expects callback first
    // so do a little switcharoo
    callback = args.pop();
    args.unshift(callback);

    utils.nextTick.apply(null, args);
  }
};

exports.init = function (opts, callback) {
  quiet = opts.quiet;

  utils.nextTick(callback);
};
