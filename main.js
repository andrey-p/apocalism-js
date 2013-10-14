#!/usr/bin/nodejs
/*jslint indent: 2, node: true*/
"use strict";

var program = require("commander"),
  pdf = require("./pdf.js"),
  html = require("./html.js"),
  phantomWrapper = require("./phantom-wrapper.js"),
  util = require("util"),
  fs = require("fs");

function cleanup(callback) {
  phantomWrapper.cleanup(callback);
}

function fail(msg) {
  cleanup(function () {
    util.error(msg);
    process.exit(1);
  });
}

function success(msg) {
  cleanup(function () {
    util.puts(msg);
    process.exit();
  });
}

function compileBook(file) {
  if (!program.output) {
    fail("needs to specify output file (-o flag)");
    return;
  }

  function generatedPdf(err, pathToPdf) {
    if (err) {
      fail(err);
      return;
    }

    success("pdf generated at: " + pathToPdf);
  }

  function generatedHtml(err, htmlMarkup) {
    if (err) {
      fail(err);
      return;
    }

    pdf.generatePdfFromPages(htmlMarkup, program.output, generatedPdf);
  }

  function readFile(err, markdown) {
    if (err) {
      fail(err);
      return;
    }

    html.generateFromMarkdown(markdown, generatedHtml);
  }

  fs.readFile(file, { encoding: "utf-8" }, readFile);
}

program
  .version("0.0.1")
  .usage("[command] [options] <file>")
  .option("-o, --output <outputFile>");

program
  .command("book <file>")
  .action(compileBook);

program
  .command("*")
  .action(compileBook);

program.parse(process.argv);
