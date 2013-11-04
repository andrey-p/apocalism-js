/*jslint indent: 2, node: true*/
"use strict";

var book = require("./book.js"),
  async = require("async"),
  reader = require("./reader.js"),
  progress = require("./progress.js"),
  options = require("./options.js"),
  util = require("util");

function fail(msg) {
  throw new Error(msg);
}

function success(msg) {
  progress.message(msg);
  process.exit();
}

exports.compileBook = function (file) {
  var markup;

  async.waterfall([
    function (callback) {
      reader.read(file, callback);
    },
    function (bookSections, callback) {
      book.compile(bookSections, callback);
    }
  ], function (err, pathToPdf) {
    if (err) {
      fail(err);
      return;
    }

    success("pdf output at: " + pathToPdf);
  });
};
