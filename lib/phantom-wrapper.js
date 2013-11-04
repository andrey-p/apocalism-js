/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var fs = require("fs"),
  async = require("async"),
  exec = require("child_process").exec,
  os = require("os");

exports.createPage = function (blankPage, markup, dimensions, callback) {
  var pathToBlankPage = os.tmpdir() + "/tmp_blank_page.html",
    pathToOverflow = os.tmpdir() + "/tmp_content.html";

  async.series([
    function (callback) {
      fs.writeFile(pathToOverflow, markup, callback);
    },
    function (callback) {
      fs.writeFile(pathToBlankPage, blankPage, callback);
    },
    function (callback) {
      exec("phantomjs " + __dirname + "/phantom-scripts/create-page.js "
          + pathToBlankPage + " "
          + pathToOverflow + " "
          + dimensions.width + " "
          + dimensions.height, callback);
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

exports.generatePdfPage = function (markup, pathToPdf, dimensions, callback) {
  var pathToHtml = os.tmpdir() + "/tmp_book_page.html";

  async.series([
    function (callback) {
      fs.writeFile(pathToHtml, markup, callback);
    },
    function (callback) {
      exec("phantomjs " + __dirname + "/phantom-scripts/create-pdf-page.js "
          + pathToHtml + " "
          + pathToPdf + " "
          + dimensions.width + " "
          + dimensions.height, callback);
    }
  ], function (err, result) {
    callback(err, pathToPdf);
  });
};
