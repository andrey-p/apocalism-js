/*jslint indent: 2, nomen:true, node: true*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  stock = require("./dimensions.js").stock;

exports.generateFromHtml = function (markup, path, callback) {
  var page;

  function pageRendered(err) {
    callback(err);
  }

  function setContent(err) {
    if (err) {
      callback(err);
      return;
    }
    page.render(path, pageRendered);
  }

  function setPaperSize(err) {
    if (err) {
      callback(err);
      return;
    }

    page.set("content", markup, setContent);
  }

  function gotPage(err, phantomPage) {
    if (err) {
      callback(err);
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

  phantomWrapper.getPage(gotPage);
};
