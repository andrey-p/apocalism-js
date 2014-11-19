"use strict";

var formatters = require("./formatters"),
  async = require("async"),
  reporter = require("./reporter"),
  utils = require("./utils"),
  options;

exports.run = function (chunks, callback) {
  var methodsBeforeHtml = [
      async.apply(reporter.log, "Splitting sections..."),
      async.apply(formatters.splitSections, chunks)
    ],
    methodsAfterHtml = [
      async.apply(reporter.log, "Paginating..."),
      async.apply(formatters.paginate, {
        ignoreBlank: options.ignoreBlank,
        hasBleed: options.hasBleed,
        dimensions: options.dimensions,
        output: options.output
      }),
      async.apply(reporter.log, "Formatting done!")
    ],
    methods = [];

  if (options.images) {
    methodsBeforeHtml = methodsBeforeHtml.concat([
      async.apply(reporter.log, "Sorting out images..."),
      async.apply(formatters.imageFallback, options.pathToImages),
      async.apply(formatters.imageResolve, options.pathToImages)
    ]);
    methodsAfterHtml = [
      async.apply(reporter.log, "Adding HTML attributes to images..."),
      async.apply(formatters.imageAddAttributes, {
        loResDPI: options.loResDPI,
        hiResDPI: options.hiResDPI,
        loRes: options.loRes
      }),
      formatters.imageStripPTags
    ].concat(methodsAfterHtml);
  }

  methods = methods.concat(methodsBeforeHtml).concat([
    async.apply(reporter.log, "Converting to HTML..."),
    formatters.toHtml
  ]).concat(methodsAfterHtml);

  async.waterfall(methods, callback);
};

exports.init = function (opts, callback) {
  options = opts;

  utils.nextTick(callback);
};
