/*jslint indent: 2, node: true*/
"use strict";

var paginator = require("./paginator.js"),
  async = require("async"),
  pdf = require("./pdf.js"),
  images = require("./images.js"),
  options = require("./options.js");

exports.compile = function (sections, callback) {
  var sectionsBeforeContent = ["inside-front-cover", "front-cover"],
    sectionsAfterContent = ["inside-back-cover", "back-cover"],
    pages = [],
    sectionName;

  async.waterfall([
    function (callback) {
      paginator.paginate(sections.content, callback);
    },
    function (bodyPages, callback) {
      pages = bodyPages;
      async.eachSeries(sectionsBeforeContent,
        function (sectionName, callback) {
          paginator.createStandalonePage(sectionName,
            sections[sectionName],
            function (err, page) {
              pages.unshift(page);
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
              pages.push(page);
              callback();
            });
        },
        callback);
    },
    function (callback) {
      pdf.generatePdfFromPages(pages, options.output, callback);
    }
  ], callback);
};
