/*jslint indent: 2, node: true*/
"use strict";

var async = require("async"),
  parser = require("./parser.js"),
  fs = require("fs"),
  path = require("path"),
  bodyFilename,
  pathToImages,
  textBasedSections = [
    "front-cover",
    "back-cover",
    "inside-front-cover",
    "inside-back-cover",
    "front-matter",
    "back-matter",
    "body"
  ],
  imageFallbackSections = [
    "front-cover",
    "back-cover",
    "inside-front-cover",
    "inside-back-cover"
  ],
  imageFormatsSupported = [
    "png", "jpg"
  ];

exports.read = function (callback) {
  var markdownPaths = {},
    imagePaths = {},
    sections = {};

  // text based sections are ones that check for markdown first
  textBasedSections.forEach(function (sectionName) {
    markdownPaths[sectionName] = "./" + sectionName + ".md";
  });

  markdownPaths.body = "./" + bodyFilename + ".md";

  imageFallbackSections.forEach(function (sectionName) {
    imagePaths[sectionName] = [];

    imageFormatsSupported.forEach(function (extension) {
      imagePaths[sectionName].push(pathToImages + sectionName + "." + extension);
    });
  });

  function getImageForSection(sectionName, callback) {
    var markup;

    async.filter(imagePaths[sectionName],
      fs.exists,
      function (results) {
        if (results.length) {
          markup = "<img src=\"" + path.basename(results[0]) + "\" />";
          sections[sectionName] = markup;
        } else {
          sections[sectionName] = "";
        }

        callback();
      });
  }

  async.each(textBasedSections,
    function (sectionName, callback) {
      fs.readFile(markdownPaths[sectionName], { encoding: "utf-8" }, function (err, data) {
        if (err && sectionName === "body") {
          // body is the only required section, so throw an error
          callback("Could not find main story file at: " + process.cwd() + "/" + bodyFilename + ".md");
        } else if (err && imagePaths[sectionName]) {
          getImageForSection(sectionName, callback);
        } else if (data) {
          sections[sectionName] = parser.parseMarkdown(data);
          callback();
        } else {
          sections[sectionName] = "";
          callback();
        }
      });
    },
    function (err) {
      callback(err, sections);
    });
};

exports.init = function (options, callback) {
  pathToImages = options.pathToImages;
  bodyFilename = options.filename;
  callback();
};
