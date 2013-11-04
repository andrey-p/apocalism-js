/*jslint indent: 2, node: true*/
"use strict";

var async = require("async"),
  fs = require("fs");

exports.createDirsIfNotExist = function (dirs, callback) {
  async.reject(dirs,
    fs.exists,
    function (filteredDirs) {
      async.each(filteredDirs, fs.mkdir, callback);
    });
};
