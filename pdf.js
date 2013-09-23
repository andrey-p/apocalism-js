/*jslint indent: 2, node: true*/
"use strict";

var phantom = require("node-phantom");

exports.generateFromHtml = function (markup, path, callback) {
  var ph,
    page;

  function killPhantom(callback) {
    ph.exit(function () {
      ph._phantom.kill("SIGTERM");
      callback();
    });
  }

  function pageRendered(err) {
    killPhantom(function () {
      callback(err);
    });
  }

  function setContent(err) {
    if (err) {
      killPhantom(function () {
        callback(err);
      });
      return;
    }
    page.render(path, pageRendered);
  }

  function setPaperSize(err) {
    if (err) {
      killPhantom(function () {
        callback(err);
      });
      return;
    }

    page.set("content", markup, setContent);
  }

  function createdPage(err, phantomPage) {
    if (err) {
      killPhantom(function () {
        callback(err);
      });
      return;
    }

    page = phantomPage;
    page.set("paperSize", { format: 'A5', orientation: 'portrait', border: "1cm" }, setPaperSize);
  }

  function createdPhantom(err, phantomInstance) {
    if (err) {
      callback(err);
      return;
    }

    ph = phantomInstance;
    ph.createPage(createdPage);
  }

  phantom.create(createdPhantom);
};
