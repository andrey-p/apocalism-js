#!/usr/bin/nodejs
/*jslint indent: 2, node: true*/
"use strict";

var program = require("commander"),
  book = require("./book.js"),
  phantomWrapper = require("./phantom-wrapper.js"),
  reader = require("./reader.js"),
  util = require("util");

function cleanup(callback) {
  phantomWrapper.cleanup(callback);
}

function fail(msg) {
  cleanup(function () {
    throw new Error(msg);
  });
}

function success(msg) {
  cleanup(function () {
    util.puts(msg);
    process.exit();
  });
}

function compileBook(file) {
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
}

program
  .version("0.0.6")
  .usage("[command] <file>");

program
  .command("book <file>")
  .action(compileBook);

program
  .command("*")
  .action(compileBook);

program.parse(process.argv);
