"use strict";

/*
* turns
*
* [{
*   content: "lorem ipsum... [very long page]",
*   classes: ["body"]
* }]
*
* to
*
* [{
*   content: "lorem ipsum... [chopped off at some point]",
*   classes: ["body", "recto", "page-1", "pdf"],
*   order: 1,
*   pageNumber: 1
* },{
*   content: "[what was chopped off]",
*   classes: ["body", "verso", "page-2", "pdf"],
*   order: 2,
*   pageNumber: 2
* }]
*
* because the content needs to be split into different page-sized chunks
*
* this works via a continuous process where the phantom wrapper creates a page,
* fills it in until it starts overflowing, and returns the bits that overflowed
* until there's no more text left
*
* pageNumber is the number of the page within the section, whereas order is the
* position of the page within the entire book
*
* cover sections should have no pageNumber at all
*/
var phantomWrapper = require("../wrappers/phantom-wrapper"),
  async = require("async"),
  htmlPage = require("../html-page"),
  utils = require("../utils"),
  sections = require("../common-data/sections"),
  totalPageCount,
  pageCountForSections,
  arg = require("arg-err");

function getPageDimensions(dimensions, hasBleed) {
  return {
    width: (dimensions.stock.width + (hasBleed ? dimensions.bleed * 2 : 0) - (dimensions.margin.outer + dimensions.margin.spine)) * 300 / 25.4,
    height: (dimensions.stock.height + (hasBleed ? dimensions.bleed * 2 : 0) - (dimensions.margin.top + dimensions.margin.bottom)) * 300 / 25.4
  };
}

function paginateChunk(opts, chunk, callback) {
  var blankPage,
    pages = [],
    leftover = chunk.content;

  function createNextPage(callback) {
    var optsForTemplate = {
      css: opts.css,
      classes: []
    };

    totalPageCount += 1;
    pageCountForSections[chunk.section] += 1;

    optsForTemplate.classes.push(chunk.section);
    optsForTemplate.classes.push(totalPageCount % 2 ? "recto" : "verso");
    optsForTemplate.classes.push("page-" + pageCountForSections[chunk.section]);
    optsForTemplate.classes.push(opts.output);
    if (opts.hasBleed) {
      optsForTemplate.classes.push("has-bleed");
    }

    blankPage = htmlPage.getPageForPagination(optsForTemplate);

    phantomWrapper.createPage({
      blankPage: blankPage,
      markup: leftover,
      dimensions: getPageDimensions(opts.dimensions, opts.hasBleed)
    }, function (err, page, leftoverMarkup) {
      if (err) { return callback(err); }

      leftover = leftoverMarkup.trim();

      // skip page if ignoreBlank is true and nothing has been filled in
      if (opts.ignoreBlank && page.length === 0) {
        return callback();
      }

      pages.push({
        classes: optsForTemplate.classes,
        content: page,
        section: chunk.section,
        pageNumber: pageCountForSections[chunk.section],
        tempIndex: chunk.tempIndex
      });

      callback();
    });
  }

  async.doWhilst(
    createNextPage,
    function () { return leftover && leftover.length; },
    function (err) {
      callback(err, pages);
    }
  );
}

module.exports = function (opts, chunks, callback) {
  var pages = [],
    err = arg.err(opts, {
      ignoreBlank: "boolean",
      hasBleed: "boolean",
      output: "string",
      dimensions: {
        stock: {
          width: "number",
          height: "number"
        },
        bleed: "number",
        margin: {
          top: "number",
          outer: "number",
          spine: "number",
          bottom: "number"
        }
      }
    });

  if (err) { return utils.nextTick(callback, err); }

  // with straightforward "async.each" we can't guarantee the order of chunks
  // (and eachSeries makes things slower)
  // so we're adding temporary numbering to make sure

  chunks.forEach(function (chunk, i) {
    chunk.tempIndex = i;
  });

  // we need to keep track of how many pages we've added in total
  // in order to keep consistent page numbers
  pageCountForSections = {};
  totalPageCount = 0;

  sections.forEach(function (section) {
    pageCountForSections[section] = 0;
  });

  async.eachSeries(chunks,
    function (chunk, callback) {
      paginateChunk(opts, chunk, function (err, pagesForChunk) {
        if (err) { return callback(err); }

        if (!pagesForChunk.length) {
          return callback();
        }

        pages = pages.concat(pagesForChunk);

        callback();
      });
    }, function (err) {
      pages.forEach(function (page, i) {
        page.order = i + 1;
        delete page.tempIndex;
      });

      callback(err, pages);
    });
};
