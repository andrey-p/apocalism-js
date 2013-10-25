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
  namp = require("namp"),
  images = require("./images.js"),
  options = require("./options.js");

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

  function setOptions(err) {
    if (err) {
      fail(err);
      return;
    }

    images.resolveImagesInMarkup(markup, program.pathToImages, resolvedImages);
  }

  function readFile(err, markdown) {
    var nampResult;
    if (err) {
      fail(err);
      return;
    }

    nampResult = namp(markdown);
    markup = html.prepMarkup(nampResult.html);
    options.set(nampResult.metadata, setOptions);
  }

  fs.readFile(file, { encoding: "utf-8" }, readFile);
}

program
  .version("0.0.5")
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
