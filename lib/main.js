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
  images = require("./images.js"),
  modulesToInit = {
    book: book,
    paginator: paginator,
    reader: reader,
    progress: progress,
    cache: cache,
    pdf: pdf,
    template: template,
    images: images
  };

function fail(msg) {
  throw new Error(msg);
}

function success(msg) {
  progress.message(msg);
  process.exit();
}

function init(fileName, optionsFromCli, callback) {
  reader.getOptions(fileName, function (err, optionsFromMarkdown) {
    if (err) {
      callback(err);
      return;
    }

    async.mapSeries([optionsFromMarkdown, optionsFromCli], options.set, function (err, opts) {
      if (err) {
        callback(err);
        return;
      }

      async.each(Object.keys(modulesToInit), function (moduleName, callback) {
        modulesToInit[moduleName].init(opts[1], callback);
      }, callback);

    });
  });
}

exports.compilePdf = function (fileName, optionsFromCli) {
  var markup,
    sections;

  async.waterfall([
    function (callback) {
      init(fileName, optionsFromCli, callback);
    },
    function (callback) {
      reader.read(fileName, callback);
    },
    function (bookSections, callback) {
      sections = bookSections;
      book.compilePdf(sections, callback);
    }
  ], function (err, pathToPdf) {
    if (err) {
      fail(err);
      return;
    }

    success("pdf output at: " + pathToPdf);
  });
};

exports.compileWebpage = function (fileName, optionsFromCli) {
  var markup,
    sections;

  // don't need bleed or hi-res images for web
  optionsFromCli.hasBleed = false;
  optionsFromCli.loRes = true;

  async.waterfall([
    function (callback) {
      init(fileName, optionsFromCli, callback);
    },
    function (callback) {
      reader.read(fileName, callback);
    },
    function (bookSections, callback) {
      sections = bookSections;
      book.compileWebpage(sections, callback);
    }
  ], function (err, pathToPdf) {
    if (err) {
      fail(err);
      return;
    }

    success("pdf output at: " + pathToPdf);
  });
};
