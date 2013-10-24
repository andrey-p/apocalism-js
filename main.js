#!/usr/bin/nodejs
/*jslint indent: 2, node: true*/
"use strict";

var program = require("commander"),
  pdf = require("./pdf.js"),
  paginator = require("./paginator.js"),
  html = require("./html.js"),
  phantomWrapper = require("./phantom-wrapper.js"),
  util = require("util"),
  fs = require("fs"),
  images = require("./images.js"),
  template = require("./template.js");

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
  if (!program.pathToImages) {
    fail("needs to specify path to images (-i flag)");
    return;
  }

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

  function generatedPages(err, pages) {
    if (err) {
      fail(err);
      return;
    }

    pdf.generatePdfFromPages(pages, program.output, generatedPdf);
  }

  function resolvedImages(err, markup) {
    if (err) {
      fail(err);
      return;
    }

    paginator.paginate(markup, generatedPages);
  }

  function readFile(err, markdown) {
    var markup;
    if (err) {
      fail(err);
      return;
    }

    markup = html.generateAndPrepMarkup(markdown);

    images.resolveImagesInMarkup(markup, program.pathToImages, resolvedImages);
  }

  function initialisedTemplate(err) {
    if (err) {
      fail(err);
      return;
    }

    fs.readFile(file, { encoding: "utf-8" }, readFile);
  }

  template.init("default", initialisedTemplate);
}

program
  .version("0.0.1")
  .usage("[command] [options] <file>")
  .option("-i, --path-to-images <pathToImages>")
  .option("-o, --output <outputFile>");

program
  .command("book <file>")
  .action(compileBook);

program
  .command("*")
  .action(compileBook);

program.parse(process.argv);
