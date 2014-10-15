"use strict";

var defaults = {
  pathToOutput: "output",
  pathToTmp: "output/tmp",
  pathToDebug: "output/debug",
  pathToImages: "images",
  dimensions: {
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
    }
  },
  hasBleed: true,
  loRes: false,
  output: "pdf",
  quiet: false,
  debug: false,
  concat: true,
  hiResDPI: 300,
  loResDPI: 96,
  filename: null,
  ignoreBlank: false
},
  optionsSet = {},
  changeCase = require("case"),
  utils = require("./utils");

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

  utils.nextTick(callback, null, optionsSet);
};

exports.reset = function () {
  var prop;
  for (prop in defaults) {
    if (defaults.hasOwnProperty(prop)) {
      delete optionsSet[prop];
    }
  }
};
