/*jslint indent: 2, node: true*/
"use strict";

var async = require("async"),
  options = require("./options.js"),
  fs = require("fs-extra");

exports.saveHtml = function (pageIndex, contents, callback) {
  fs.writeFile(options.pathToHtmlCache + "/" + pageIndex + ".html",
    contents,
    callback);
};

exports.getCachedPdfs = function (callback) {
  async.waterfall([
    function (callback) {
      fs.readdir(options.pathToPdfCache, callback);
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
        return options.pathToPdfCache + "/" + filename;
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
      fs.readFile(options.pathToHtmlCache + "/" + pageIndex + ".html",
        { encoding: "utf8" },
        callback);
    },
    pdf: function (callback) {
      fs.readFile(options.pathToPdfCache + "/" + pageIndex + ".pdf",
        callback);
    }
  }, function (err, result) {
    callback(!!err || result.html !== contents);
  });
};

exports.init = function (callback) {
  async.reject([options.pathToHtmlCache, options.pathToPdfCache],
    fs.exists,
    function (filteredDirs) {
      async.each(filteredDirs, fs.mkdirp, callback);
    });
};
