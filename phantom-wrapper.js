/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var fs = require("fs"),
  exec = require("child_process").exec,
  os = require("os");

exports.createPage = function (blankPage, markup, dimensions, callback) {
  var pathToBlankPage = os.tmpdir() + "/tmp_blank_page.html",
    pathToOverflow = os.tmpdir() + "/tmp_content.html",
    updatedPage,
    updatedOverflow;

  function readPage(err, data) {
    if (err) {
      callback(err);
      return;
    }

    updatedPage = data;

    callback(null, updatedPage, updatedOverflow);
  }

  function readOverflow(err, data) {
    if (err) {
      callback(err);
      return;
    }

    updatedOverflow = data;

    fs.readFile(pathToBlankPage, { encoding: "utf8" }, readPage);
  }

  function doneWithScript(err, stdout, stderr) {
    if (err) {
      callback(err);
      return;
    }

    fs.readFile(pathToOverflow, { encoding: "utf8" }, readOverflow);
  }

  function wroteBlankPage(err) {
    if (err) {
      callback(err);
      return;
    }

    exec("phantomjs " + __dirname + "/phantom-scripts/create-page.js "
        + pathToBlankPage + " "
        + pathToOverflow + " "
        + dimensions.width + " "
        + dimensions.height, doneWithScript);
  }

  function wroteOveflow(err) {
    if (err) {
      callback(err);
      return;
    }

    fs.writeFile(pathToBlankPage, blankPage, wroteBlankPage);
  }

  fs.writeFile(pathToOverflow, markup, wroteOveflow);
};

exports.generatePdfPage = function (markup, pathToPdf, dimensions, callback) {
  var pathToHtml = os.tmpdir() + "/tmp_book_page.html";

  function doneWithScript(err, stdout, stderr) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, pathToPdf);
  }

  function wrotePage(err) {
    if (err) {
      callback(err);
      return;
    }

    exec("phantomjs " + __dirname + "/phantom-scripts/create-pdf-page.js "
        + pathToHtml + " "
        + pathToPdf + " "
        + dimensions.width + " "
        + dimensions.height, doneWithScript);
  }

  fs.writeFile(pathToHtml, markup, wrotePage);
};
