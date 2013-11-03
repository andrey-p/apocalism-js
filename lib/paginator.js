/*jslint indent: 2, node: true*/
/*globals document*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
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

exports.paginate = function (content, callback) {
  var htmlMarkup,
    blankPage,
    pages = [],
    currentPage = 1,
    className = "recto";

  function createdPage(err, page, leftover) {
    if (err) {
      callback(err);
      return;
    }

    pages.push(page);

    progress.update(pages.length + " (" + (leftover.length || "0") + " characters left)");

    if (leftover && leftover.length) {
      currentPage += 1;
      className = currentPage % 2 ? "verso" : "recto";
      blankPage = template.getBlankPage({ pageNumber: currentPage, className: className });
      exports.createPage(blankPage, leftover, createdPage);
    } else {
      progress.end();
      callback(null, pages);
    }
  }

  blankPage = template.getBlankPage({
    pageNumber: currentPage,
    className: "recto"
  });

  progress.start("Generating pages");
  exports.createPage(blankPage, content, createdPage);
};

exports.createStandalonePage = function (className, markup, callback) {
  var blankPage = template.getBlankPage({
    className: className
  });

  function createdPage(err, page, leftover) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, page);
  }

  exports.createPage(blankPage, markup, createdPage);
};
