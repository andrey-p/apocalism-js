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

  if (err) {
    return callback(err);
  }

  async.series([
    function (callback) {
      fs.writeFile(pathToOverflow, args.markup, callback);
    },
    function (callback) {
      fs.writeFile(pathToBlankPage, args.blankPage, callback);
    },
    function (callback) {
      exec("phantomjs " + __dirname + "/phantom-scripts/create-page.js "
          + pathToBlankPage + " "
          + pathToOverflow + " "
          + args.dimensions.width + " "
          + args.dimensions.height, callback);
    },
    function (callback) {
      fs.readFile(pathToBlankPage, { encoding: "utf8" }, callback);
    },
    function (callback) {
      fs.readFile(pathToOverflow, { encoding: "utf8" }, callback);
    }
  ], function (err, result) {
    var updatedPage,
      updatedOverflow;

    if (err) {
      callback(err);
      return;
    }

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

  if (err) {
    return callback(err);
  }

  async.series([
    function (callback) {
      fs.writeFile(pathToHtml, args.markup, callback);
    },
    function (callback) {
      exec("phantomjs " + __dirname + "/phantom-scripts/create-pdf-page.js "
          + pathToHtml + " "
          + args.pathToPdf + " "
          + args.dimensions.width + " "
          + args.dimensions.height, callback);
    }
  ], function (err) {
    callback(err, args.pathToPdf);
  });
};
