/*jslint indent: 2, nomen:true, node: true*/
"use strict";

var phantom = require("node-phantom"),
  stock = require("./dimensions.js").stock;

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
    page.set("paperSize", {
      // do I still need bleed * 2 if one of the sides is not being cut off?
      width: (stock.width + stock.bleed * 2) + "mm",
      height: (stock.height + stock.bleed * 2) + "mm",
      border: "0mm" // border is handled by html.js
    }, setPaperSize);
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
