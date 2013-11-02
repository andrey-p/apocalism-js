#!/usr/bin/nodejs
/*jslint indent: 2, node: true*/
"use strict";

var program = require("commander"),
  book = require("./book.js"),
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

    options.quiet = program.quiet;

    book.compile(bookSections, compiledBook);
  }

  reader.read(file, resolvedBookSections);
}

program
  .version("0.0.8")
  .option("-q, --quiet", "Don't output progress info")
  .usage("[command] <file>");

program
  .command("book <file>")
  .action(compileBook);

program
  .command("*")
  .action(compileBook);

program.parse(process.argv);
