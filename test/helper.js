"use strict";

var exec = require("child_process").exec;

exports.getDefaultOpts = function () {
  return {
    filename: "test",
    template: "pdf",
    stock: {
      width: 148,
      height: 210
    },
    margin: {
      top: 15,
      spine: 15,
      bottom: 20,
      outer: 15
    },
    quiet: true,
    hiResDPI: 300,
    loResDPI: 96,
    bleed: 2,
    hasBleed: true,
    pathToOutput: "output/",
    pathToImages: "output/output.pdf",
    pathToTmp: "output/tmp/",
    progress: require("../lib/dummy-progress.js")
  };
};

exports.getSamplePages = function () {
  return [
    {
      order: 1,
      htmlContent: "<html><body><p>foo</p></body></html>"
    },
    {
      order: 2,
      htmlContent: "<html><body><p>bar</p></body></html>"
    }
  ];
};

// returns true if process exists
exports.checkIfProcessExists = function (processName, callback) {
  exec("pgrep " + processName, function (error, stdout) {
    // error code 1 means no matches
    if (error && error.code !== 1) {
      callback(error);
    } else {
      callback(null, !!stdout.length);
    }
  });
};

// kills all instances of process
exports.killProcess = function (processName, callback) {
  exec("pkill " + processName, function (error, stdout) {
    // error code 1 means no process of that name found,
    // which is ok for cleaning up
    if (error && error.code !== 1) {
      callback(error);
    } else {
      callback(null, stdout);
    }
  });
};

// output mimetype of file
exports.getFileMimeType = function (path, callback) {
  exec("file -b --mime-type " + path, function (error, stdout) {
    if (error) {
      callback(error);
    } else {
      callback(null, stdout);
    }
  });
};

exports.getPdfPaperSize = function (path, callback) {
  exec("pdfinfo " + path + " | grep \"Page size:.*\" | grep -Eo \"[0-9]+ x [0-9]+\"", function (error, stdout) {
    if (error) {
      callback(error);
    } else {
      callback(null, stdout);
    }
  });
};
