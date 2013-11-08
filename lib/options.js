/*jslint indent: 2, node: true*/
"use strict";

var defaults = {
  output: "output/output.pdf",
  pathToCache: "output/cache/",
  pathToImages: "images/",
  stock: "148x210mm",
  bleed: "2mm",
  margin: "15mm 15mm 20mm 15mm",
  template: "default",
  quiet: false,
  title: null,
  author: null
},
  optionsSet = {},
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
        optionsSet[prop] = normalisedOptions[prop];
      } else if (typeof optionsSet[prop] === "undefined"
          && defaults[prop] !== null) {
        optionsSet[prop] = defaults[prop];
      }

      if (typeof optionsSet[prop] === "undefined") {
        callback("missing required option: " + prop);
        return;
      }
    }
  }

  optionsSet.stock = parseStock(optionsSet.stock);
  optionsSet.bleed = parseBleed(optionsSet.bleed);
  optionsSet.margin = parseMargins(optionsSet.margin);

  callback(null, optionsSet);
};

exports.reset = function () {
  var prop;
  for (prop in defaults) {
    if (defaults.hasOwnProperty(prop)) {
      delete optionsSet[prop];
    }
  }
};
