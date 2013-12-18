/*jslint indent: 2, node: true*/
"use strict";

var path = require("path"),
  util = require("util"),
  async = require("async"),
  fs = require("fs-extra"),
  reader = require("./reader.js"),
  progress = require("./progress.js"),
  book = require("./book.js"),
  options = require("./options.js"),
  paginator = require("./paginator.js"),
  pdf = require("./pdf.js"),
  template = require("./template.js"),
  images = require("./images.js"),
  pathToTmp,
  modulesToInit = {
    book: book,
    paginator: paginator,
    reader: reader,
    progress: progress,
    pdf: pdf,
    template: template,
    images: images
  };

// makes debugging evented code loads easier
require("long-stack-traces");

function cleanup(callback) {
  fs.remove(pathToTmp, callback);
}

function fail(msg) {
  cleanup(function () {
    throw new Error(msg);
  });
}

function success(msg) {
  cleanup(function () {
    progress.message(msg);
    process.exit();
  });
}

function init(fileName, optionsFromCli, callback) {
  var opts;

  async.waterfall([
    function (callback) {
      reader.getOptions(fileName, callback);
    },
    function (optionsFromMarkdown, callback) {
      async.mapSeries([optionsFromMarkdown, optionsFromCli], options.set, callback);
    },
    function (setOpts, callback) {
      opts = setOpts[1];

      pathToTmp = opts.pathToTmp;
      async.each(Object.keys(modulesToInit), function (moduleName, callback) {
        modulesToInit[moduleName].init(opts, callback);
      }, callback);
    },
    function (callback) {
      var foldersToCreate = [pathToTmp];

      if (opts.debug) {
        foldersToCreate.push(opts.pathToDebug);
      }

      async.each(foldersToCreate, fs.mkdirp, callback);
    }
  ], callback);
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
  optionsFromCli.template = "webpage";
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
