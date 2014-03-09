"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  pdftkWrapper = require("./pdftk-wrapper.js"),
  os = require("os"),
  async = require("async"),
  fs = require("fs"),
  progress,
  stock,
  bleed,
  hasBleed,
  pathToTmp;

function getFilenamesWithPaths(filenames, callback) {
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
}

function concatenatePagesFromTmp(pathToPdf, callback) {
  async.waterfall([
    async.apply(fs.readdir, pathToTmp),
    getFilenamesWithPaths,
    async.apply(pdftkWrapper.concatenatePages, pathToPdf)
  ], callback);
}

exports.generatePdfFromPages = function (pages, pathToPdf, callback) {
  var numPdfs = 0,
    dimensions = {
      width: stock.width,
      height: stock.height
    };

  if (hasBleed) {
    dimensions.width += bleed * 2;
    dimensions.height += bleed * 2;
  }

  progress.start("Rendering PDF pages");

  function generatePdfPage(page, callback) {
    var args = {
      pathToPdf: pathToTmp + page.order + ".pdf",
      markup: page.htmlContent,
      dimensions: dimensions
    };
    phantomWrapper.generatePdfPage(args, function (err) {
      if (err) { return callback(err); }

      numPdfs += 1;
      progress.update(numPdfs + " of " + pages.length);
      callback();
    });
  }

  async.eachSeries(pages,
    generatePdfPage,
    function (err) {
      if (err) { return callback(err); }

      progress.end();
      concatenatePagesFromTmp(pathToPdf, callback);
    });
};

exports.init = function (options, callback) {
  stock = options.stock;
  bleed = options.bleed;
  hasBleed = options.hasBleed;
  pathToTmp = options.pathToTmp;
  progress = options.progress;
  callback();
};
