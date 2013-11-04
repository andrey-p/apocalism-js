/*jslint indent: 2, node: true*/
"use strict";

var book = require("./book.js"),
  async = require("async"),
  reader = require("./reader.js"),
  progress = require("./progress.js"),
  options = require("./options.js"),
  path = require("path"),
  file = require("./file.js"),
  util = require("util");

function fail(msg) {
  throw new Error(msg);
}

function success(msg) {
  progress.message(msg);
  process.exit();
}

exports.compileBook = function (fileName) {
  var markup,
    sections;

  async.waterfall([
    function (callback) {
      reader.read(fileName, callback);
    },
    function (bookSections, callback) {
      var outputDir = process.cwd() + "/" + path.dirname(options.output);
      sections = bookSections;
      file.createDirsIfNotExist([
        outputDir,
        outputDir + "/cache",
        outputDir + "/cache/html",
        outputDir + "/cache/pdf"
      ], callback);
    },
    function (callback) {
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
