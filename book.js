/*jslint indent: 2, node: true*/
"use strict";

var paginator = require("./paginator.js"),
  pdf = require("./pdf.js"),
  template = require("./template.js"),
  options = require("./options.js");

exports.compile = function (markup, callback) {
  function generatedPdf(err, pathToPdf) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, pathToPdf);
  }

  function generatedPages(err, pages) {
    if (err) {
      callback(err);
      return;
    }

    pdf.generatePdfFromPages(pages, options.output, generatedPdf);
  }

  paginator.paginate(markup, generatedPages);
};
