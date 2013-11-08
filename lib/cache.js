/*jslint indent: 2, node: true*/
"use strict";

var async = require("async"),
  fs = require("fs-extra"),
  pathToCache;

exports.saveHtml = function (pageIndex, contents, callback) {
  fs.writeFile(pathToCache + "/html/" + pageIndex + ".html",
    contents,
    callback);
};

exports.getCachedPdfs = function (callback) {
  async.waterfall([
    function (callback) {
      fs.readdir(pathToCache + "/pdf/", callback);
    },
    function (filenames, callback) {
      var filenamesWithPath;

      // order by the number in the name
      // to prevent, say, 11.pdf from coming before 2.pdf
      filenames.sort(function (a, b) {
        var aNum = parseInt(a.slice(0, -4), 10),
          bNum = parseInt(b.slice(0, -4), 10);
        return aNum - bNum;
      });

      filenamesWithPath = filenames.map(function (filename) {
        return pathToCache + "/pdf/" + filename;
      });

      callback(null, filenamesWithPath);
    }
  ], callback);
};

// no err in callback,
// returns true if contents of file are different or if html / pdf file missing
exports.checkIfHtmlChanged = function (pageIndex, contents, callback) {
  async.series({
    html: function (callback) {
      fs.readFile(pathToCache + "/html/" + pageIndex + ".html",
        { encoding: "utf8" },
        callback);
    },
    pdf: function (callback) {
      fs.readFile(pathToCache + "/pdf/" + pageIndex + ".pdf",
        callback);
    }
  }, function (err, result) {
    callback(!!err || result.html !== contents);
  });
};

exports.init = function (options, callback) {
  pathToCache = options.pathToCache;
  async.reject([pathToCache, pathToCache + "/html", pathToCache + "/pdf"],
    fs.exists,
    function (filteredDirs) {
      async.each(filteredDirs, fs.mkdirp, callback);
    });
};
