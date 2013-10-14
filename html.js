/*jslint indent: 2, node: true*/
"use strict";

var pandoc = require("pdc"),
  fs = require("fs"),
  sass = require("node-sass"),
  paginator = require("./paginator.js"),
  template = require("./template.js");

exports.generateFromMarkdown = function (markdown, callback) {
  var bodyMarkup;

  function initialisedTemplate(err) {
    if (err) {
      callback(err);
      return;
    }

    paginator.paginate(template.getBlankPage(), bodyMarkup, callback);
  }

  function convertedMarkdownToHtml(err, result) {
    if (err) {
      callback(err);
      return;
    }

    bodyMarkup = result;

    template.init("default", initialisedTemplate);
  }
  pandoc(markdown, "markdown", "html", convertedMarkdownToHtml);
};
