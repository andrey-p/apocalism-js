"use strict";

var outputters = require("./outputters"),
  async = require("async"),
  reporter = require("./reporter"),
  utils = require("./utils"),
  options;

exports.run = function (pages, callback) {
  var outputtersToRun = [
    async.apply(reporter.log, "Generating " + options.output + " files..."),
  ];

  if (options.images) {
    outputtersToRun = [
      async.apply(reporter.log, "Copying images to target folder..."),
      async.apply(outputters.images, options),
    ].concat(outputtersToRun);
  }

  // we've got it on good faith that we've got an outputter here
  // that matches the "output" option
  // since these are validated at the CLI level
  outputtersToRun.push(async.apply(outputters[options.output], options, pages));

  async.waterfall(outputtersToRun, callback);
};

exports.init = function (opts, callback) {
  options = opts;

  utils.nextTick(callback);
};
