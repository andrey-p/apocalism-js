/*jslint indent: 2, node: true*/
"use strict";

var defaults = {
  pathToOutput: "output/",
  pathToTmp: "output/tmp/",
  pathToDebug: "output/debug/",
  pathToImages: "images/",
  stock: {
    width: 148,
    height: 210
  },
  bleed: 2,
  margin: {
    top: 15,
    outer: 15,
    bottom: 17,
    spine: 15
  },
  hasBleed: true,
  loRes: false,
  template: "pdf",
  quiet: false,
  debug: false,
  hiResDPI: 300,
  loResDPI: 96,
  filename: null,
  progress: require("./dummy-progress.js"),
  ignoreBlank: false
},
  optionsSet = {},
  changeCase = require("case");

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
