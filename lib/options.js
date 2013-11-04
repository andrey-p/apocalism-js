/*jslint indent: 2, node: true*/
"use strict";

var defaults = {
  output: "output/output.pdf",
  pathToImages: "images/",
  stock: "148x210mm",
  bleed: "2mm",
  margin: "15mm 15mm 20mm 15mm",
  template: "default",
  quiet: false,
  title: null,
  author: null
},
  template = require("./template.js"),
  changeCase = require("case");

function parseStock(stock) {
  var regex = /(\d+)x(\d+)/,
    match = stock.match(regex);

  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10)
  };
}

function parseBleed(bleed) {
  var regex = /\d+/,
    match = bleed.match(regex);

  return parseInt(match[0], 10);
}

function parseMargins(margins) {
  var regex = /(\d+)/g,
    match = margins.match(regex);

  return {
    top: parseInt(match[0], 10),
    outer: parseInt(match[1], 10),
    bottom: parseInt(match[2], 10),
    spine: parseInt(match[3], 10),
  };
}

exports.set = function (optionsToSet, callback) {
  var prop,
    normalisedOptions = {};

  // normalise option keys
  for (prop in optionsToSet) {
    if (optionsToSet.hasOwnProperty(prop)) {
      normalisedOptions[changeCase.camel(prop)] = optionsToSet[prop];
    }
  }

  for (prop in defaults) {
    if (defaults.hasOwnProperty(prop)) {
      if (normalisedOptions.hasOwnProperty(prop)) {
        exports[prop] = normalisedOptions[prop];
      } else if (typeof exports[prop] === "undefined"
          && defaults[prop] !== null) {
        exports[prop] = defaults[prop];
      }

      if (typeof exports[prop] === "undefined") {
        callback("missing required option: " + prop);
        return;
      }
    }
  }

  exports.stock = parseStock(exports.stock);
  exports.bleed = parseBleed(exports.bleed);
  exports.margin = parseMargins(exports.margin);

  template.init(exports.template, {
    stock: exports.stock,
    bleed: exports.bleed,
    margin: exports.margin
  }, callback);
};

exports.reset = function () {
  var prop;
  for (prop in defaults) {
    if (defaults.hasOwnProperty(prop)) {
      delete exports[prop];
    }
  }
};
