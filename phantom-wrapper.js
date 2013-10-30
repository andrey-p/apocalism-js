/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var phantom = require("node-phantom"),
  fs = require("fs"),
  exec = require("child_process").exec,
  os = require("os"),
  phantomInstance;

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

exports.getInstance = function (callback) {
  if (phantomInstance) {
    callback(null, phantomInstance);
  } else {
    phantom.create(function (err, phantom) {
      phantomInstance = phantom;
      callback(err, phantomInstance);
    });
  }
};

exports.cleanup = function (callback) {
  if (phantomInstance) {
    phantomInstance.exit(function () {
      phantomInstance._phantom.kill("SIGTERM");
      callback();
    });
  } else {
    callback();
  }
};

exports.getPage = function (callback) {

  function gotPhantomInstance(err, instance) {
    if (err) {
      callback(err);
      return;
    }

    instance.createPage(function (err, page) {
      page.onConsoleMessage = function (msg) {
        console.log("phantom says: " + msg);
      };

      callback(err, page);
    });
  }

  exports.getInstance(gotPhantomInstance);
};
