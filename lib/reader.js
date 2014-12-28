"use strict";

var async = require("async"),
  fs = require("fs"),
  bodyFilename,
  utils = require("./utils"),
  sections = require("./common-data/sections");

function getContentForSection(sectionName, callback) {
  var path = "./" + (sectionName === "body" ? bodyFilename : sectionName) + ".md";

  fs.readFile(path, { encoding: "utf-8" }, function (err, data) {
    if (err && sectionName === "body") {
      // body is the only required section, so throw an error
      return callback("Could not find main story file at: " + process.cwd() + "/" + bodyFilename + ".md");
    }

    if (err) {
      data = null;
    }

    callback(null, {
      content: data,
      section: sectionName
    });
  });
}

exports.read = function (callback) {
  var markdownPaths = {};

  // text based sections are ones that check for markdown first
  sections.forEach(function (sectionName) {
    markdownPaths[sectionName] = "./" + sectionName + ".md";
  });

  markdownPaths.body = "./" + bodyFilename + ".md";

  async.map(sections, getContentForSection, callback);
};

exports.init = function (options, callback) {
  bodyFilename = options.filename;
  utils.nextTick(callback);
};
