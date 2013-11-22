/*jslint indent: 2, node: true*/
/*globals document*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  async = require("async"),
  progress = require("./progress.js"),
  template = require("./template.js"),
  stock,
  bleed,
  hasBleed,
  margin;

exports.createPage = function (blankPage, content, callback) {
  var dimensions = {
    width: (stock.width + (hasBleed ? bleed * 2 : 0) - (margin.outer + margin.spine)) * 300 / 25.4,
    height: (stock.height + (hasBleed ? bleed * 2 : 0) - (margin.top + margin.bottom)) * 300 / 25.4
  };

  phantomWrapper.createPage(blankPage,
    content,
    dimensions,
    callback);
};

// "args" is:
//  - sectionName
//  - content
//  - classes (optional)
exports.paginate = function (args, callback) {
  var htmlMarkup,
    blankPage,
    pages = [],
    currentPage = 0,
    leftover,
    classes;

  if (typeof args.sectionName === "undefined"
      || typeof args.content === "undefined") {
    callback("args needs to specify sectionName and content");
    return;
  }

  leftover = args.content;

  progress.start("Generating pages for " + args.sectionName + " section");

  async.whilst(
    function () { return leftover && leftover.length; },
    function (callback) {
      currentPage += 1;
      classes = (args.classes && args.classes.concat()) || [];
      classes.push(args.sectionName);
      classes.push(currentPage % 2 ? "verso" : "recto");
      classes.push("page-" + currentPage);
      blankPage = template.getBlankPage("page", { pageNumber: currentPage, classes: classes });

      exports.createPage(blankPage, leftover, function (err, page, leftoverMarkup) {
        if (err) {
          callback(err);
          return;
        }

        leftover = leftoverMarkup;
        progress.update(Math.round(100 - 100 * leftover.length / args.content.length) + "% "
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

// "args" is:
//  - sectionName
//  - content
//  - classes (optional)
exports.createStandalonePage = function (args, callback) {
  var blankPage,
    classes;

  if (typeof args.sectionName === "undefined"
      || typeof args.content === "undefined") {
    callback("args needs to specify sectionName and content");
    return;
  }

  classes = args.classes || [];

  classes.push(args.sectionName);

  blankPage = template.getBlankPage("page", {
    classes: classes
  });

  exports.createPage(blankPage, args.content, callback);
};

exports.init = function (options, callback) {
  stock = options.stock;
  margin = options.margin;
  bleed = options.bleed;
  hasBleed = options.hasBleed;
  callback();
};
