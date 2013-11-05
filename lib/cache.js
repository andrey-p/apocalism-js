/*jslint indent: 2, node: true*/
"use strict";

var async = require("async"),
  options = require("./options.js"),
  fs = require("fs-extra");

exports.init = function (callback) {
  async.reject([options.pathToHtmlCache, options.pathToPdfCache],
    fs.exists,
    function (filteredDirs) {
      async.each(filteredDirs, fs.mkdirp, callback);
    });
};
