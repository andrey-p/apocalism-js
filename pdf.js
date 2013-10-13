/*jslint indent: 2, nomen:true, node: true*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  os = require("os"),
  template = require("./template.js");

exports.generateFromHtml = function (markup, path, callback) {
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

exports.generatePagesFromHtml = function (pages, callback) {
  var page,
    pathsToPdfs = [],
    path;

  if (pages.length === 0) {
    callback(null, []);
    return;
  }

  page = pages.shift();

  function generatedPdf(err, pathToPdf) {
    if (err) {
      callback(err);
      return;
    }

    pathsToPdfs.push(pathToPdf);

    if (pages.length === 0) {
      callback(null, pathsToPdfs);
      return;
    }

    page = pages.shift();
    path = os.tmpDir() + "/apoc_js_" + Date.now() + ".pdf";
    exports.generateFromHtml(page, path, generatedPdf);
  }

  path = os.tmpDir() + "/apoc_js_" + Date.now() + ".pdf";

  exports.generateFromHtml(page, path, generatedPdf);
};
