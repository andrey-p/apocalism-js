/*jslint indent: 2, node: true*/
/*globals document*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  async = require("async"),
  arg = require("arg-err"),
  template = require("./template.js"),
  progress,
  stock,
  bleed,
  hasBleed,
  ignoreBlank,
  margin;

function createPage(blankPage, content, callback) {
  var dimensions = {
    width: (stock.width + (hasBleed ? bleed * 2 : 0) - (margin.outer + margin.spine)) * 300 / 25.4,
    height: (stock.height + (hasBleed ? bleed * 2 : 0) - (margin.top + margin.bottom)) * 300 / 25.4
  };

  phantomWrapper.createPage({
    blankPage: blankPage,
    markup: content,
    dimensions: dimensions,
  }, callback);
}

// check if pages are the same accounting for whitespace
// that may have been added or removed
function pagesAreTheSame(page1, page2) {
  return page1.replace(/\s/g, "") === page2.replace(/\s/g, "");
}

// "args" is:
//  - sectionName
//  - content
//  - classes (optional)
exports.paginate = function (args, callback) {
  var blankPage,
    pages = [],
    currentPage = 0,
    leftover,
    classes,
    err = arg.err(args, {
      sectionName: "string",
      content: "string"
    });

  if (err) { return callback(err); }

  leftover = args.content;

  progress.start("Generating pages for " + args.sectionName + " section");

  function createNextPage(callback) {
    currentPage += 1;
    classes = (args.classes && args.classes.concat()) || [];
    classes.push(args.sectionName);
    classes.push(currentPage % 2 ? "verso" : "recto");
    classes.push("page-" + currentPage);
    blankPage = template.getBlankPage("page", { pageNumber: currentPage, classes: classes });

    createPage(blankPage, leftover, function (err, page, leftoverMarkup) {
      if (err) { return callback(err); }

      leftover = leftoverMarkup;
      progress.update(Math.round(100 - 100 * leftover.length / args.content.length) + "% "
        + "(" + pages.length + " pages so far)");

      // skip page if ignoreBlank is true and nothing has been filled in
      if (ignoreBlank && pagesAreTheSame(page, blankPage)) {
        return callback();
      }

      pages.push(page);
      callback();
    });
  }

  async.whilst(
    function () { return leftover && leftover.length; },
    createNextPage,
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
    classes,
    err = arg.err(args, {
      sectionName: "string",
      content: "string"
    });

  if (err) { return callback(err); }

  classes = args.classes || [];

  classes.push(args.sectionName);

  blankPage = template.getBlankPage("page", {
    classes: classes
  });

  createPage(blankPage, args.content, function (err, page) {
    if (err) { return callback(err); }

    if (ignoreBlank && pagesAreTheSame(page, blankPage)) {
      callback();
    } else {
      callback(null, page);
    }
  });
};

exports.init = function (options, callback) {
  stock = options.stock;
  margin = options.margin;
  bleed = options.bleed;
  hasBleed = options.hasBleed;
  progress = options.progress;
  ignoreBlank = options.ignoreBlank;
  callback();
};
