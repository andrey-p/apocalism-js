/*jslint indent: 2, node: true*/
"use strict";

var book = require("./book.js"),
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

  function compiledBook(err, pathToPdf) {
    if (err) {
      fail(err);
      return;
    }

    success("pdf output at: " + pathToPdf);
  }

  function resolvedBookSections(err, bookSections) {
    if (err) {
      fail(err);
      return;
    }

    book.compile(bookSections, compiledBook);
  }

  reader.read(file, resolvedBookSections);
};
