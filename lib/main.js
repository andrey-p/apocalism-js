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
    template: template
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

function init(filename, optionsFromCli, callback) {
  var opts;

  // this is needed for output
  optionsFromCli.filename = path.basename(filename, ".md");

  // change the pwd to the working file
  process.chdir(path.dirname(filename));

  async.waterfall([
    async.apply(options.set, optionsFromCli),
    function (setOpts, callback) {
      opts = setOpts;

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

exports.compilePdf = function (filename, optionsFromCli) {
  async.waterfall([
    async.apply(init, filename, optionsFromCli),
    async.apply(reader.read, filename),
    book.compilePdf
  ], function (err, pathToPdf) {
    if (err) { return fail(err); }

    success("pdf output at: " + pathToPdf);
  });
};

exports.compileWebpage = function (filename, optionsFromCli) {
  // don't need bleed or hi-res images for web
  optionsFromCli.template = "webpage";
  optionsFromCli.hasBleed = false;
  optionsFromCli.loRes = true;

  async.waterfall([
    async.apply(init, filename, optionsFromCli),
    async.apply(reader.read, filename),
    book.compileWebpage
  ], function (err, pathToPdf) {
    if (err) { return fail(err); }

    success("pdf output at: " + pathToPdf);
  });
};
