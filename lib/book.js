/*jslint indent: 2, node: true*/
"use strict";

var paginator = require("./paginator.js"),
  async = require("async"),
  pdf = require("./pdf.js"),
  images = require("./images.js"),
  cache = require("./cache.js"),
  progress = require("./progress.js"),
  changeCase = require("case"),
  outputPath = "",
  title = "";

function updatePagesCache(pages, callback) {
  async.each(pages,
    function (page, callback) {
      cache.saveHtml(page.order, page.htmlContent, function (err) {
        callback(err);
      });
    },
    callback);
}

function filterUnchangedPages(pages, callback) {
  var filteredPages = [];
  async.eachSeries(pages, function (page, callback) {
    cache.checkIfHtmlChanged(page.order, page.htmlContent, function (result) {
      if (result) {
        filteredPages.push(page);
      }
      callback();
    });
  },
    function (err) {
      callback(err, filteredPages);
    });
}

exports.compile = function (sections, callback) {
  var sectionsBeforeContent = ["inside-front-cover", "front-cover"],
    sectionsAfterContent = ["inside-back-cover", "back-cover"],
    contentSections = ["front-matter", "body", "back-matter"],
    pages = [],
    pathToPdf,
    sectionName;

  function processContentSection(sectionName, callback) {
    if (sections[sectionName].length) {
      paginator.paginate(sectionName,
        sections[sectionName],
        function (err, sectionPages) {
          if (err) {
            callback(err);
            return;
          }

          sectionPages = sectionPages.map(function (page) {
            return {
              order: null,
              htmlContent: page
            };
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
          paginator.createStandalonePage(sectionName,
            sections[sectionName],
            function (err, page) {
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
          paginator.createStandalonePage(sectionName,
            sections[sectionName],
            function (err, page) {
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
    },
    function (callback) {
      filterUnchangedPages(pages, callback);
    },
    function (filteredPages, callback) {
      var pdfFileName = outputPath + changeCase.snake(title) + ".pdf";
      pdf.generatePdfFromPages(filteredPages, pdfFileName, callback);
    },
    function (path, callback) {
      pathToPdf = path;

      if (pages.length % 4 !== 0) {
        progress.message("warning: page numbers not divisible by 4, this book is not printable");
      }

      updatePagesCache(pages, callback);
    }
  ], function (err) {
    callback(err, pathToPdf);
  });
};

exports.init = function (options, callback) {
  outputPath = options.pathToOutput;
  title = options.title;
  callback();
};
