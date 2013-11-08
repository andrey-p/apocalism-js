/*jslint indent: 2, node: true*/
"use strict";

var path = require("path"),
  util = require("util"),
  async = require("async"),
  reader = require("./reader.js"),
  progress = require("./progress.js"),
  book = require("./book.js"),
  options = require("./options.js"),
  cache = require("./cache.js"),
  paginator = require("./paginator.js"),
  pdf = require("./pdf.js"),
  template = require("./template.js"),
  modulesToInit = {
    book: book,
    paginator: paginator,
    reader: reader,
    progress: progress,
    cache: cache,
    pdf: pdf,
    template: template
  };

function fail(msg) {
  throw new Error(msg);
}

function success(msg) {
  progress.message(msg);
  process.exit();
}

function init(optionsFromMarkdown, callback) {
  options.set(optionsFromMarkdown, function (err, opts) {

    async.each(Object.keys(modulesToInit), function (moduleName, callback) {
      modulesToInit[moduleName].init(opts, callback);
    }, callback);

  });
}

exports.compileBook = function (fileName) {
  var markup,
    sections;

  async.waterfall([
    function (callback) {
      reader.getOptions(fileName, callback);
    },
    function (optionsFromMarkdown, callback) {
      init(optionsFromMarkdown, callback);
    },
    function (callback) {
      reader.read(fileName, callback);
    },
    function (bookSections, callback) {
      sections = bookSections;
      book.compile(sections, callback);
    }
  ], function (err, pathToPdf) {
    if (err) {
      fail(err);
      return;
    }

    success("pdf output at: " + pathToPdf);
  });
};
