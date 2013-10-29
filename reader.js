/*jslint indent: 2, node: true*/
"use strict";

var images = require("./images.js"),
  namp = require("namp"),
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
      fs.statFile(options.pathToImages + "/" + pageName + ".png", checkedForImageFile);
      return;
    }

    markup = html.prepMarkup(namp(markdown).html);

    images.resolveImagesInMarkup(markup, options.pathToImages, callback);
  }

  fs.readFile(process.cwd() + "/" + pageName + ".md", { encoding: "utf-8" }, readMarkdownFile);
};

exports.read = function (pathToFile, callback) {
  var standalonePages = ["front", "back", "inside-front-cover", "inside-back-cover"],
    markup,
    sections = {},
    pageToRead;

  function doneReadingStandalonePage(err, resolvedPageMarkup) {
    if (err) {
      callback(err);
      return;
    }

    sections[pageToRead] = resolvedPageMarkup;

    if (standalonePages.length === 0) {
      callback(null, sections);
    } else {
      pageToRead = standalonePages.shift();
      exports.readStandalonePage(pageToRead, doneReadingStandalonePage);
    }
  }

  function resolvedImagesInBody(err, resolvedMarkup) {
    if (err) {
      callback(err);
      return;
    }

    sections.content = resolvedMarkup;

    pageToRead = standalonePages.shift();

    exports.readStandalonePage(pageToRead, doneReadingStandalonePage);
  }

  function setOptions(err) {
    if (err) {
      callback(err);
      return;
    }

    images.resolveImagesInMarkup(markup, options.pathToImages, resolvedImagesInBody);
  }

  function readFile(err, markdown) {
    var nampResult;
    if (err) {
      callback(err);
      return;
    }

    nampResult = namp(markdown);
    markup = html.prepMarkup(nampResult.html);
    options.set(nampResult.metadata, setOptions);
  }

  process.chdir(path.dirname(pathToFile));

  fs.readFile(path.basename(pathToFile), { encoding: "utf-8" }, readFile);

};
