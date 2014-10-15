"use strict";

var arg = require("arg-err"),
  fs = require("fs-extra"),
  async = require("async"),
  htmlPage = require("../../lib/html-page"),
  utils = require("../utils");

module.exports = function (opts, pages, callback) {
  var err = arg.err(opts, {
    pathToOutput: "string",
    filename: "string",
    css: "string",
    concat: "boolean"
  }),
    operations = [];

  if (err) { utils.nextTick(callback, err); }

  operations.push(async.apply(fs.mkdirp, opts.pathToOutput));

  if (opts.concat) {
    operations.push(async.apply(fs.writeFile,
      opts.pathToOutput + "/" + opts.filename + ".html",
      htmlPage.getPages({ pages: pages })));
    operations.push(async.apply(fs.writeFile,
      opts.pathToOutput + "/style.css",
      opts.css));
  } else {
    pages.forEach(function (page) {
      page.css = opts.css;

      operations.push(async.apply(fs.writeFile,
        opts.pathToOutput + "/" + page.order + ".html",
        htmlPage.getPageForPagination(page)));
    });
  }

  async.series(operations, callback);
};
