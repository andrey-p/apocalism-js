"use strict";

var formatters = require("./formatters"),
  async = require("async"),
  reporter = require("./reporter"),
  utils = require("./utils"),
  options;

exports.run = function (chunks, callback) {
  async.waterfall([
    async.apply(reporter.log, "Splitting sections..."),
    async.apply(formatters.splitSections, chunks),
    async.apply(reporter.log, "Sorting out images..."),
    async.apply(formatters.imageFallback, options.pathToImages),
    async.apply(formatters.imageResolve, options.pathToImages),
    async.apply(reporter.log, "Converting to HTML..."),
    formatters.toHtml,
    async.apply(reporter.log, "Adding HTML attributes to images..."),
    async.apply(formatters.imageAddAttributes, {
      loResDPI: options.loResDPI,
      hiResDPI: options.hiResDPI,
      loRes: options.loRes
    }),
    formatters.imageStripPTags,
    async.apply(reporter.log, "Paginating..."),
    async.apply(formatters.paginate, {
      ignoreBlank: options.ignoreBlank,
      hasBleed: options.hasBleed,
      dimensions: options.dimensions
    }),
    async.apply(reporter.log, "Formatting done!"),
  ], callback);
};

exports.init = function (opts, callback) {
  options = opts;

  utils.nextTick(callback);
};
