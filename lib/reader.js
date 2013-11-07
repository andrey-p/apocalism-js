/*jslint indent: 2, node: true*/
"use strict";

var images = require("./images.js"),
  namp = require("namp"),
  async = require("async"),
  html = require("./html.js"),
  fs = require("fs"),
  path = require("path"),
  options = require("./options.js");

exports.readStandalonePage = function (pageName, callback) {
  function checkedForImageFile(err) {
    var markup;
    if (err) {
      // if it can't find that, assume blank
      callback(null, "");
      return;
    }

    // else create an image tag and have it resolve
    markup = "<img src=\"" + pageName + ".png\" />";
    images.resolveImageTag(markup, options.pathToImages, callback);
  }

  function readMarkdownFile(err, markdown) {
    var markup;

    if (err) {
      // if it can't find {pageName}.md,
      // try to find {pageName}.png in the images folder
      // TODO handle other formats
      fs.stat(options.pathToImages + "/" + pageName + ".png", checkedForImageFile);
      return;
    }

    markup = html.prepMarkup(namp(markdown).html);

    images.resolveImagesInMarkup(markup, options.pathToImages, callback);
  }

  fs.readFile(process.cwd() + "/" + pageName + ".md", { encoding: "utf-8" }, readMarkdownFile);
};

exports.read = function (pathToFile, callback) {
  var standalonePages = ["front-cover", "back-cover", "inside-front-cover", "inside-back-cover", "front-matter", "back-matter"],
    markup,
    sections = {},
    pageToRead;

  process.chdir(path.dirname(pathToFile));

  async.waterfall([
    function (callback) {
      fs.readFile(path.basename(pathToFile), { encoding: "utf-8" }, callback);
    }, function (markdown, callback) {
      var nampResult = namp(markdown);
      markup = html.prepMarkup(nampResult.html);
      options.set(nampResult.metadata, callback);
    }, function (callback) {
      images.resolveImagesInMarkup(markup, options.pathToImages, callback);
    }, function (resolvedMarkup, callback) {
      sections.body = resolvedMarkup;

      async.each(standalonePages,
        function (standalonePage, callback) {
          exports.readStandalonePage(standalonePage, function (err, result) {
            if (err) {
              callback(err);
              return;
            }
            sections[standalonePage] = result;
            callback();
          });
        },
        function (err) {
          callback(err);
        });
    }
  ], function (err, result) {
    callback(err, sections);
  });
};
