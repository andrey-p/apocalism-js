/*jslint indent: 2, node: true*/
"use strict";

var defaults = {
  pathToOutput: "output/",
  pathToTmp: "output/tmp/",
  pathToDebug: "output/debug/",
  pathToImages: "images/",
  stock: "148x210mm",
  bleed: "2mm",
  margin: "15mm 15mm 17mm 15mm",
  hasBleed: true,
  loRes: false,
  template: "pdf",
  quiet: false,
  debug: false,
  title: "",
  author: ""
},
  optionsSet = {},
  template = require("./template.js"),
  changeCase = require("case"),
  parsers = {
    stock: function (stock) {
      var regex = /(\d+)x(\d+)/,
        match = stock.match(regex);

      return {
        width: parseInt(match[1], 10),
        height: parseInt(match[2], 10)
      };
    },
    bleed: function (bleed) {
      var regex = /\d+/,
        match = bleed.match(regex);

      return parseInt(match[0], 10);
    },
    margin: function (margins) {
      var regex = /(\d+)/g,
        match = margins.match(regex);

      return {
        top: parseInt(match[0], 10),
        outer: parseInt(match[1], 10),
        bottom: parseInt(match[2], 10),
        spine: parseInt(match[3], 10),
      };
    }
  };


exports.set = function (optionsToSet, callback) {
  var prop,
    normalisedOptions = {};

  // normalise option keys
  for (prop in optionsToSet) {
    if (optionsToSet.hasOwnProperty(prop)
        && optionsToSet[prop] !== undefined) {
      normalisedOptions[changeCase.camel(prop)] = optionsToSet[prop];
    }
  }

  for (prop in defaults) {
    if (defaults.hasOwnProperty(prop)) {
      if (normalisedOptions.hasOwnProperty(prop)) {
        optionsSet[prop] = normalisedOptions[prop];
      } else if (optionsSet[prop] === undefined
          && defaults[prop] !== null) {
        optionsSet[prop] = defaults[prop];
      }

      if (optionsSet[prop] === undefined) {
        callback("missing required option: " + prop);
        return;
      }
    }
  }

  ["stock", "bleed", "margin"].forEach(function (prop) {
    if (typeof optionsSet[prop] === "string") {
      optionsSet[prop] = parsers[prop](optionsSet[prop]);
    }
  });

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
