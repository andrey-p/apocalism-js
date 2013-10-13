/*jslint indent: 2, nomen:true, node: true*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  pdftkWrapper = require("./pdftk-wrapper.js"),
  os = require("os"),
  template = require("./template.js");

exports.generatePdfPage = function (markup, path, callback) {
  var page;

  function pageRendered(err) {
    callback(err, path);
  }

  function setContent(err) {
    if (err) {
      callback(err);
      return;
    }
    page.render(path, pageRendered);
  }

  function setPaperSize(err) {
    if (err) {
      callback(err);
      return;
    }

    page.set("content", markup, setContent);
  }

  function gotPage(err, phantomPage) {
    if (err) {
      callback(err);
      return;
    }

    page = phantomPage;
    page.set("paperSize", {
      // do I still need bleed * 2 if one of the sides is not being cut off?
      width: (template.stock.width + template.stock.bleed * 2) + "mm",
      height: (template.stock.height + template.stock.bleed * 2) + "mm",
      border: "0mm" // border is handled by html.js
    }, setPaperSize);
  }

  phantomWrapper.getPage(gotPage);
};

exports.generatePdfFromPages = function (pages, callback) {
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

  function generatedPdfPage(err, pathToPdf) {
    if (err) {
      callback(err);
      return;
    }

    pathsToPdfs.push(pathToPdf);

    if (pages.length === 0) {
      pdftkWrapper.concatenatePages(pathsToPdfs, concatenatedPages);
      return;
    }

    page = pages.shift();
    path = os.tmpDir() + "/apoc_js_" + Date.now() + ".pdf";
    exports.generatePdfPage(page, path, generatedPdfPage);
  }

  path = os.tmpDir() + "/apoc_js_" + Date.now() + ".pdf";

  exports.generatePdfPage(page, path, generatedPdfPage);
};
