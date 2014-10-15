"use strict";

var path = require("path"),
  util = require("util"),
  async = require("async"),
  fs = require("fs-extra"),
  formatter = require("./formatter"),
  reader = require("./reader.js"),
  reporter = require("./reporter"),
  initialiser = require("./initialiser.js"),
  outputter = require("./outputter"),
  phantomWrapper = require("./wrappers/phantom-wrapper.js"),
  pathToTmp,
  modulesToCleanup = [
    phantomWrapper
  ];

function cleanup(callback) {
  phantomWrapper.cleanup(callback);
}

function fail(msg) {
  cleanup(function () {
    throw new Error(msg);
  });
}

exports.compile = function (filename, optionsFromCli, callback) {
  async.waterfall([
    async.apply(reporter.log, "Setting up..."),
    async.apply(initialiser.run, filename, optionsFromCli),
    async.apply(reporter.log, "Reading markdown files..."),
    async.apply(reader.read),
    formatter.run,
    outputter.run
  ], function (err) {
    if (callback) {
      callback(err);
    } else if (err) {
      fail(err);
    } else {
      reporter.log("Book generated successfully!");
      phantomWrapper.cleanup(function () { return; });
    }
  });
};
