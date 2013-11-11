/*jslint indent: 2, node: true*/
/*globals document*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  async = require("async"),
  progress = require("./progress.js"),
  template = require("./template.js"),
  stock,
  bleed,
  margin;

exports.createPage = function (blankPage, content, callback) {
  phantomWrapper.createPage(blankPage,
    content,
    {
      width: (stock.width + bleed * 2 - (margin.outer + margin.spine)) * 300 / 25.4,
      height: (stock.height + bleed * 2 - (margin.top + margin.bottom)) * 300 / 25.4
    },
    callback);
};

exports.paginate = function (sectionName, content, callback) {
  var htmlMarkup,
    blankPage,
    pages = [],
    currentPage = 0,
    leftover = content,
    classes;

  progress.start("Generating pages for " + sectionName + " section");

  async.whilst(
    function () { return leftover && leftover.length; },
    function (callback) {
      currentPage += 1;
      classes = [sectionName];
      classes.push(currentPage % 2 ? "verso" : "recto");
      classes.push("page-" + currentPage);
      blankPage = template.getBlankPage({ pageNumber: currentPage, classes: classes });

      exports.createPage(blankPage, leftover, function (err, page, leftoverMarkup) {
        if (err) {
          callback(err);
          return;
        }

        leftover = leftoverMarkup;
        progress.update(Math.round(100 - 100 * leftover.length / content.length) + "% "
          + "(" + pages.length + " pages so far)");
        pages.push(page);
        callback();
      });
    },
    function (err) {
      progress.end();
      callback(err, pages);
    }
  );
};

exports.createStandalonePage = function (classes, markup, callback) {
  var blankPage;

  if (typeof classes === "string") {
    classes = [classes];
  }

  blankPage = template.getBlankPage({
    classes: classes
  });

  exports.createPage(blankPage, markup, callback);
};

exports.init = function (options, callback) {
  stock = options.stock;
  margin = options.margin;
  bleed = options.bleed;
  callback();
};
