/*jslint indent: 2, node: true*/
"use strict";

var async = require("async"),
  html = require("./html.js"),
  fs = require("fs"),
  path = require("path"),
  bodyFilename,
  pathToImages;

function readStandalonePage(pageName, callback) {
  function checkForImageFile() {
    fs.stat(pathToImages + "/" + pageName + ".png", function (err) {
      var markup;
      // if it can't find an image file, assume blank
      if (err) { return callback(null, ""); }

      // else create an image tag and have it resolve
      markup = "<img src=\"" + pageName + ".png\" />";
      callback(null, markup);
    });
  }

  fs.readFile(process.cwd() + "/" + pageName + ".md",
    { encoding: "utf-8" },
    function (err, markdown) {
      var markup;

      // if it can't find {pageName}.md,
      // try to find {pageName}.png in the images folder
      if (err) { return checkForImageFile(); }

      markup = html.fromMarkdown(markdown);

      callback(null, markup);
    });
}

exports.read = function (callback) {
  var standalonePages = [
    "front-cover",
    "back-cover",
    "inside-front-cover",
    "inside-back-cover",
    "front-matter",
    "back-matter"
  ],
    markup,
    sections = {};

  async.waterfall([
    async.apply(fs.readFile, process.cwd() + "/" + bodyFilename + ".md", { encoding: "utf-8" }),
    function (markdown, callback) {
      markup = html.fromMarkdown(markdown);
      sections.body = markup;

      async.map(standalonePages,
        readStandalonePage,
        function (err, result) {
          var i;
          for (i = 0; i < result.length; i += 1) {
            sections[standalonePages[i]] = result[i];
          }
          callback(err, sections);
        });
    }
  ], callback);
};

exports.init = function (options, callback) {
  pathToImages = options.pathToImages;
  bodyFilename = options.filename;
  callback();
};
