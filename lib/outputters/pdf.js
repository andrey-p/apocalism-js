"use strict";

var arg = require("arg-err"),
  utils = require("../utils"),
  fs = require("fs-extra"),
  phantomWrapper = require("../wrappers/phantom-wrapper"),
  pdfTkWrapper = require("../wrappers/pdftk-wrapper"),
  htmlPage = require("../html-page"),
  async = require("async");

function createPdf(opts, page, callback) {
  var dimensions = {
      width: opts.dimensions.stock.width,
      height: opts.dimensions.stock.height
    },
    markup,
    pdfName = opts.pathToOutput + "/" + page.order + ".pdf";

  if (opts.hasBleed) {
    dimensions.width += opts.dimensions.bleed * 2;
    dimensions.height += opts.dimensions.bleed * 2;
  }

  markup = htmlPage.getPageForPagination(page);

  phantomWrapper.generatePdfPage({
    pathToPdf: pdfName,
    dimensions: dimensions,
    markup: markup
  }, function (err) {
    callback(err, pdfName);
  });
}

function cleanupImages(opts, callback) {
  fs.remove(opts.pathToOutput + "/" + opts.pathToImages, callback);
}

function concatenateAndDeleteSparePages(opts, pathsToPages, callback) {
  async.series([
    async.apply(pdfTkWrapper.concatenatePages, opts.pathToOutput + "/" + opts.filename + ".pdf", pathsToPages),
    async.apply(async.forEach, pathsToPages, fs.remove),
    async.apply(cleanupImages, opts)
  ], callback);
}

module.exports = function (opts, pages, callback) {
  var err = arg.err(opts, {
    pathToOutput: "string",
    dimensions: {
      stock: {
        width: "number",
        height: "number"
      },
      bleed: "number"
    },
    hasBleed: "boolean",
    filename: "string",
    concat: "boolean"
  });

  if (err) {
    return utils.nextTick(callback, err);
  }

  async.mapSeries(pages,
    async.apply(createPdf, opts),
    function (err, pathsToPages) {
      if (err) { return callback(err); }

      if (opts.concat) {
        concatenateAndDeleteSparePages(opts, pathsToPages, callback);
      } else {
        cleanupImages(opts, callback);
      }
    });
};
