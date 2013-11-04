/*jslint indent: 2, nomen:true, node: true*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  pdftkWrapper = require("./pdftk-wrapper.js"),
  os = require("os"),
  async = require("async"),
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
  var pathsToPdfs = [];

  if (pages.length === 0) {
    callback(null, []);
    return;
  }

  progress.start("Rendering PDF pages");

  async.eachSeries(pages,
    function (page, callback) {
      var path = os.tmpDir() + "/apoc_js_" + Date.now() + ".pdf";
      exports.generatePdfPage(page, path, function (err, pathForPage) {
        if (err) {
          callback(err);
          return;
        }

        pathsToPdfs.push(pathForPage);
        progress.update(pathsToPdfs.length + " of " + pages.length);
        callback();
      });
    },
    function (err) {
      if (err) {
        callback(err);
        return;
      }

      progress.end();
      pdftkWrapper.concatenatePages(pathsToPdfs, pathToPdf, callback);
    });
};
