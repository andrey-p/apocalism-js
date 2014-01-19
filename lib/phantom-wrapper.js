/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var fs = require("fs"),
  async = require("async"),
  exec = require("child_process").exec,
  os = require("os"),
  arg = require("arg-err");

exports.createPage = function (args, callback) {
  var pathToBlankPage = os.tmpdir() + "/tmp_blank_page.html",
    pathToOverflow = os.tmpdir() + "/tmp_content.html",
    err = arg.err(args, {
      blankPage: "string",
      dimensions: { width: "number", height: "number" },
      markup: "string"
    });

  if (err) { return callback(err); }

  // strip HTML comments as they choke the pagination script
  args.markup = args.markup.replace(/<!--([\s\S]+)?-->/g, "");

  async.series([
    async.apply(fs.writeFile, pathToOverflow, args.markup),
    async.apply(fs.writeFile, pathToBlankPage, args.blankPage),
    async.apply(exec, "phantomjs " + __dirname + "/phantom-scripts/create-page.js "
          + pathToBlankPage + " "
          + pathToOverflow + " "
          + args.dimensions.width + " "
          + args.dimensions.height),
    async.apply(fs.readFile, pathToBlankPage, { encoding: "utf8" }),
    async.apply(fs.readFile, pathToOverflow, { encoding: "utf8" })
  ], function (err, result) {
    var updatedPage,
      updatedOverflow;

    if (err) { return callback(err); }

    updatedPage = result[3];
    updatedOverflow = result[4];

    callback(null, updatedPage, updatedOverflow);
  });
};

exports.generatePdfPage = function (args, callback) {
  var pathToHtml = os.tmpdir() + "/tmp_book_page.html",
    err = arg.err(args, {
      pathToPdf: "string",
      dimensions: { width: "number", height: "number" },
      markup: "string"
    });

  if (err) { return callback(err); }

  async.series([
    async.apply(fs.writeFile, pathToHtml, args.markup),
    async.apply(exec, "phantomjs " + __dirname + "/phantom-scripts/create-pdf-page.js "
          + pathToHtml + " "
          + args.pathToPdf + " "
          + args.dimensions.width + " "
          + args.dimensions.height)
  ], function (err) {
    callback(err, args.pathToPdf);
  });
};
