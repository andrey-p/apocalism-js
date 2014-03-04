/*jslint indent: 2, node: true*/
"use strict";

var paginator = require("./paginator.js"),
  async = require("async"),
  fs = require("fs"),
  pdf = require("./pdf.js"),
  images = require("./images.js"),
  html = require("./html.js"),
  template = require("./template.js"),
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
  var sectionsBeforeContent = ["inside-front-cover", "front-cover"],
    sectionsAfterContent = ["inside-back-cover", "back-cover"],
    contentSections = ["front-matter", "body", "back-matter"],
    pages = [];

  function processContentSection(sectionName, callback) {
    if (sections[sectionName].length) {
      paginator.paginate({
        sectionName: sectionName,
        content: sections[sectionName],
        classes: hasBleed ? ["has-bleed"] : []
      },
        function (err, sectionPages) {
          if (err) { return callback(err); }

          sectionPages = sectionPages.map(function (page) {
            return { order: null, htmlContent: page };
          });

          pages = pages.concat(sectionPages);

          callback();
        });
    } else {
      callback();
    }
  }

  async.waterfall([
    function (callback) {
      async.eachSeries(contentSections,
        processContentSection,
        callback);
    },
    function (callback) {
      async.eachSeries(sectionsBeforeContent,
        function (sectionName, callback) {
          paginator.createStandalonePage({
            sectionName: sectionName,
            content: sections[sectionName],
            classes: hasBleed ? ["has-bleed"] : []
          },
            function (err, page) {
              if (err) {
                return callback(err);
              }

              pages.unshift({
                order: null,
                htmlContent: page
              });
              callback();
            });
        },
        callback);
    },
    function (callback) {
      async.eachSeries(sectionsAfterContent,
        function (sectionName, callback) {
          paginator.createStandalonePage({
            sectionName: sectionName,
            content: sections[sectionName],
            classes: hasBleed ? ["has-bleed"] : []
          },
            function (err, page) {
              if (err) {
                callback(err);
                return;
              }

              pages.push({
                order: null,
                htmlContent: page
              });

              // all pages are added, we can add the order
              pages.forEach(function (page, i) {
                page.order = (i + 1);
              });

              callback();
            });
        },
        callback);
    }],
    function (err) {
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
        return html.getBodyContent(page.htmlContent);
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
