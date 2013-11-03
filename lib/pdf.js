/*jslint indent: 2, nomen:true, node: true*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  pdftkWrapper = require("./pdftk-wrapper.js"),
  os = require("os"),
  progress = require("./progress.js"),
  options = require("./options.js");

exports.generatePdfPage = function (markup, path, callback) {
  var dimensions = {
    width: (options.stock.width + options.bleed * 2),
    height: (options.stock.height + options.bleed * 2)
  };

  phantomWrapper.generatePdfPage(markup, path, dimensions, callback);
};

exports.generatePdfFromPages = function (pages, pathToPdf, callback) {
  var page,
    pathsToPdfs = [],
    path;

  if (pages.length === 0) {
    callback(null, []);
    return;
  }

  page = pages.shift();

  function concatenatedPages(err, pathToPdf) {
    callback(err, pathToPdf);
  }

  function generatedPdfPage(err, pathForPage) {
    if (err) {
      callback(err);
      return;
    }

    pathsToPdfs.push(pathForPage);

    if (pages.length === 0) {
      progress.end();
      pdftkWrapper.concatenatePages(pathsToPdfs, pathToPdf, concatenatedPages);
      return;
    }

    progress.update(pathsToPdfs.length + " of " + (pathsToPdfs.length + pages.length));

    page = pages.shift();
    path = os.tmpDir() + "/apoc_js_" + Date.now() + ".pdf";
    exports.generatePdfPage(page, path, generatedPdfPage);
  }

  path = os.tmpDir() + "/apoc_js_" + Date.now() + ".pdf";

  progress.start("Rendering PDF pages");

  exports.generatePdfPage(page, path, generatedPdfPage);
};
