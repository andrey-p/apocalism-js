#!/usr/bin/nodejs
/*jslint indent: 2, node: true*/
"use strict";

var program = require("commander"),
  pdf = require("./pdf.js"),
  html = require("./html.js"),
  util = require("util"),
  fs = require("fs");

function fail(msg) {
  util.error(msg);
  process.exit(1);
}

function success(msg) {
  util.puts(msg);
  process.exit();
}

function compilePdf(file) {
  if (!program.output) {
    fail("needs to specify output file (-o flag)");
  }

  function generatedPdf(err) {
    if (err) {
      fail(err);
    }

    success("pdf generated at: " + program.output);
  }

  function generatedHtml(err, htmlMarkup) {
    if (err) {
      fail(err);
    }

    pdf.generate(htmlMarkup, program.output, generatedPdf);
  }

  function readFile(err, markdown) {
    if (err) {
      fail(err);
    }

    html.generate(markdown, generatedHtml);
  }

  fs.readFile(file, readFile);
}

program
  .version("0.0.1")
  .usage("[command] [options] <file>")
  .option("-o, --output <outputFile>");

program
  .command("pdf <file>")
  .action(compilePdf);

program
  .command("*")
  .action(compilePdf);

program.parse(process.argv);
