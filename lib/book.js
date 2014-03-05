/*jslint indent: 2, node: true*/
"use strict";

var paginator = require("./paginator.js"),
  async = require("async"),
  fs = require("fs"),
  pdf = require("./pdf.js"),
  images = require("./images.js"),
  template = require("./template.js"),
  utils = require("./utils.js"),
  progress,
  outputPath = "",
  pathToImages = "",
  debug,
  pathToDebug = "",
  hasBleed,
  templateName = "",
  loRes,
  filename = "";

function outputDebugPages(pages, callback) {
  if (debug) {
    async.each(pages,
      function (page, callback) {
        fs.writeFile(pathToDebug + page.order + ".html",
          page.htmlContent,
          callback);
      },
      callback);
  } else {
    callback();
  }
}

function resolveImagesInSections(sections, callback) {
  var resolvedSections = {},
    replacementPathToImages;

  if (loRes && templateName === "pdf") {
    replacementPathToImages = outputPath + "images/";
  } else {
    replacementPathToImages = pathToImages;
  }

  function resolveImagesForSection(section, callback) {
    images.resolveImagesInMarkup({
      markup: sections[section],
      actualPathToImages: pathToImages,
      replacementPathToImages: replacementPathToImages
    }, function (err, resolvedMarkup) {
      if (err) {
        callback(err);
        return;
      }

      resolvedSections[section] = resolvedMarkup;
      callback();
    });
  }

  async.waterfall([
    function (callback) {
      if (loRes) {
        images.saveImagesForScreen(pathToImages, outputPath + "images/", callback);
      } else {
        callback();
      }
    },
    function (callback) {
      async.each(Object.keys(sections), resolveImagesForSection, callback);
    }
  ], function (err) {
    callback(err, resolvedSections);
  });
}

function createPagesFromSections(sections, callback) {
  var sectionsBeforeContent = ["front-cover", "inside-front-cover"],
    sectionsAfterContent = ["inside-back-cover", "back-cover"],
    contentSections = ["front-matter", "body", "back-matter"];

  function processContentSection(sectionName, callback) {
    if (sections[sectionName].length === 0) {
      return callback();
    }

    paginator.paginate({
      sectionName: sectionName,
      content: sections[sectionName],
      classes: hasBleed ? ["has-bleed"] : []
    }, callback);
  }

  function processNonContentSection(sectionName, callback) {
    paginator.createStandalonePage({
      sectionName: sectionName,
      content: sections[sectionName],
      classes: hasBleed ? ["has-bleed"] : []
    }, callback);
  }

  async.series({
    content: function (callback) {
      async.mapSeries(contentSections,
        processContentSection,
        callback);
    },
    beforeContent: function (callback) {
      async.mapSeries(sectionsBeforeContent,
        processNonContentSection,
        callback);
    },
    afterContent: function (callback) {
      async.mapSeries(sectionsAfterContent,
        processNonContentSection,
        callback);
    }
  },
    function (err, results) {
      if (err) { return callback(err); }

      var htmlContentArray = [],
        pages = [];

      htmlContentArray = htmlContentArray.concat(utils.flattenMultiDimentionalArray(results.beforeContent),
          utils.flattenMultiDimentionalArray(results.content),
          utils.flattenMultiDimentionalArray(results.afterContent));

      pages = htmlContentArray.map(function (htmlContent, i) {
        return {
          order: i + 1,
          htmlContent: htmlContent
        };
      });

      callback(err, pages);
    });
}

exports.compilePages = function (sections, callback) {
  async.waterfall([
    async.apply(resolveImagesInSections, sections),
    async.apply(createPagesFromSections)
  ], callback);
};

exports.compilePdf = function (pages, callback) {
  var pathToPdf;

  async.waterfall([
    function (callback) {
      var pdfFileName = outputPath + filename + ".pdf";
      pdf.generatePdfFromPages(pages, pdfFileName, callback);
    },
    function (path, callback) {
      pathToPdf = path;

      if (pages.length % 4 !== 0) {
        progress.message("warning: page numbers not divisible by 4, this book is not printable");
      }

      outputDebugPages(pages, callback);
    }
  ], function (err) {
    callback(err, pathToPdf);
  });
};

exports.compileWebpage = function (pages, callback) {
  async.waterfall([
    function (callback) {
      var pagesMarkup,
        fullMarkup;

      pagesMarkup = pages.map(function (page) {
        return utils.getBodyContent(page.htmlContent);
      }).join("");

      fullMarkup = template.getTemplatePage("html_layout", {
        pagesMarkup: pagesMarkup
      });

      fs.writeFile(outputPath + filename + ".html", fullMarkup, callback);
    },
    async.apply(template.saveStyleAssetsToDir, outputPath),
    async.apply(outputDebugPages, pages)
  ], callback);
};

exports.init = function (options, callback) {
  hasBleed = options.hasBleed;
  loRes = options.loRes;
  outputPath = options.pathToOutput;
  debug = options.debug;
  pathToDebug = options.pathToDebug;
  pathToImages = options.pathToImages;
  templateName = options.template;
  progress = options.progress;
  filename = options.filename;
  callback();
};
