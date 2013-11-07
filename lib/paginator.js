/*jslint indent: 2, node: true*/
/*globals document*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  async = require("async"),
  options = require("./options.js"),
  progress = require("./progress.js"),
  template = require("./template.js");

exports.createPage = function (blankPage, content, callback) {
  phantomWrapper.createPage(blankPage,
    content,
    {
      width: (options.stock.width + options.bleed * 2 - (options.margin.outer + options.margin.spine)) * 300 / 25.4,
      height: (options.stock.height + options.bleed * 2 - (options.margin.top + options.margin.bottom)) * 300 / 25.4
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
      blankPage = template.getBlankPage({ pageNumber: currentPage, classString: classes.join(" ") });

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

exports.createStandalonePage = function (classString, markup, callback) {
  var blankPage = template.getBlankPage({
    classString: classString
  });

  exports.createPage(blankPage, markup, callback);
};