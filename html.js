/*jslint indent: 2, node: true*/
"use strict";

var pandoc = require("pdc"),
  fs = require("fs"),
  sass = require("node-sass");

exports.generateFromMarkdown = function (markdown, callback) {
  var htmlMarkup;

  function convertedSassToCss(err, result) {
    var styleTag;
    if (err) {
      callback(err);
      return;
    }

    styleTag = "<style type='text/css'>" + result + "</style>";

    callback(null, styleTag + htmlMarkup);
  }

  function convertedMarkdownToHtml(err, result) {
    if (err) {
      callback(err);
      return;
    }

    htmlMarkup = result;

    sass.render({
      file: "./template/style.scss",
      success: function (css) {
        convertedSassToCss(null, css);
      },
      error: function (err) {
        convertedSassToCss(err);
      }
    });
    callback(null, result);
  }
  pandoc(markdown, "markdown", "html", convertedMarkdownToHtml);
};
