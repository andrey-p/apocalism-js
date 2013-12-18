/*jslint indent: 2, nomen:true, node: true*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  pdftkWrapper = require("./pdftk-wrapper.js"),
  os = require("os"),
  async = require("async"),
  fs = require("fs"),
  progress = require("./progress.js"),
  stock,
  bleed,
  hasBleed,
  pathToTmp;

function concatenatePagesFromTmp(pathToPdf, callback) {
  async.waterfall([
    function (callback) {
      fs.readdir(pathToTmp, callback);
    },
    function (filenames, callback) {
      var filenamesWithPath;

      // order by the number in the name
      // to prevent, say, 11.pdf from coming before 2.pdf
      filenames.sort(function (a, b) {
        var aNum = parseInt(a.slice(0, -4), 10),
          bNum = parseInt(b.slice(0, -4), 10);
        return aNum - bNum;
      });

      filenamesWithPath = filenames.map(function (filename) {
        return pathToTmp + filename;
      });

      callback(null, filenamesWithPath);
    },
    function (pathsToPdfs, callback) {
      pdftkWrapper.concatenatePages(pathsToPdfs, pathToPdf, callback);
    }
  ], callback);
}

exports.generatePdfFromPages = function (pages, pathToPdf, callback) {
  var pathsToPdfs = [],
    dimensions = {
      width: stock.width,
      height: stock.height
    };

  if (hasBleed) {
    dimensions.width += bleed * 2;
    dimensions.height += bleed * 2;
  }

  progress.start("Rendering PDF pages");

  async.eachSeries(pages,
    function (page, callback) {
      var path = pathToTmp + page.order + ".pdf";
      phantomWrapper.generatePdfPage(page.htmlContent, path, dimensions, function (err, pathForPage) {
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
      concatenatePagesFromTmp(pathToPdf, callback);
    });
};

exports.init = function (options, callback) {
  stock = options.stock;
  bleed = options.bleed;
  hasBleed = options.hasBleed;
  pathToTmp = options.pathToTmp;
  callback();
};
