/*jslint indent: 2, node: true*/
"use strict";

var phantom = require("node-phantom");

exports.generateFromHtml = function (markup, path, callback) {
  var ph,
    page;

  function setContent(err) {
    if (err) {
      callback(err);
    } else {
      page.render(path, callback);
    }

    ph.exit();
  }

  function setPaperSize(err) {
    if (err) {
      ph.exit();
      callback(err);
      return;
    }

    page.set("content", markup, setContent);
  }

  function createdPage(err, phantomPage) {
    if (err) {
      ph.exit();
      callback(err);
      return;
    }

    page = phantomPage;
    page.set("paperSize", { format: 'A4', orientation: 'portrait', border: '1cm' }, setPaperSize);
  }

  function createdPhantom(err, phantomInstance) {
    if (err) {
      ph.exit();
      callback(err);
      return;
    }

    ph = phantomInstance;
    ph.createPage(createdPage);
  }

  phantom.create(createdPhantom);
};
