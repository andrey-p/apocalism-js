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
  phantomWrapper = require("./phantom-wrapper.js"),
  pathToTmp,
  modulesToInit = [
    book,
    paginator,
    reader,
    pdf,
    template,
    images
  ],
  modulesToCleanup = [
    phantomWrapper
  ];

// makes debugging evented code loads easier
require("long-stack-traces");

function cleanup(callback) {
  modulesToCleanup.forEach(function (module) {
    module.cleanup();
  });

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

function getManifest() {
  var manifest;
  // if manifest doesn't exist, just assume an empty object
  try {
    manifest = require(process.cwd() + "/story.json");
  } catch (e) {
    manifest = {};
  }

  return manifest;
}

function init(filename, optionsFromCli, callback) {
  var opts,
    manifest,
    prop;

  // change the pwd to the working file
  process.chdir(path.dirname(filename));

  manifest = getManifest();
  for (prop in manifest) {
    if (manifest.hasOwnProperty(prop)) {
      optionsFromCli[prop] = manifest[prop];
    }
  }

  // this is needed for output
  optionsFromCli.filename = path.basename(filename, ".md");

  // if not quiet, pass the progress module to all the other modules
  if (!optionsFromCli.quiet) {
    optionsFromCli.progress = progress;
  }

  async.waterfall([
    async.apply(options.set, optionsFromCli),
    function (processedOpts, callback) {
      opts = processedOpts;
      pathToTmp = opts.pathToTmp;
      async.each(modulesToInit, function (module, callback) {
        module.init(opts, callback);
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

exports.compilePdf = function (filename, optionsFromCli, callback) {
  async.waterfall([
    async.apply(init, filename, optionsFromCli),
    async.apply(reader.read),
    book.compilePages,
    book.compilePdf,
  ], function (err, pathToPdf) {
    if (callback) {
      callback(err, pathToPdf);
    } else {
      if (err) { return fail(err); }
      success("pdf output at: " + pathToPdf);
    }
  });
};

exports.compileWebpage = function (filename, optionsFromCli, callback) {
  // don't need bleed or hi-res images for web
  optionsFromCli.template = "webpage";
  optionsFromCli.hasBleed = false;
  optionsFromCli.loRes = true;

  async.waterfall([
    async.apply(init, filename, optionsFromCli),
    async.apply(reader.read),
    book.compilePages,
    book.compileWebpage
  ], function (err, pathToPdf) {
    if (callback) {
      callback(err, pathToPdf);
    } else {
      if (err) { return fail(err); }
      success("pdf output at: " + pathToPdf);
    }
  });
};
