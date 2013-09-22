/*jslint indent: 2, node: true*/
"use strict";

var pandoc = require("pdc"),
  fs = require("fs"),
  sass = require("node-sass");

exports.generateFromMarkdown = function (markdown, callback) {
  var htmlMarkup;

  function convertedSassToCss(err, result) {
    var styleTag,
      allMarkup;
    if (err) {
      callback(err);
      return;
    }

    styleTag = "<style type='text/css'>" + result + "</style>";

    allMarkup = "<head>";
    allMarkup += styleTag;
    allMarkup += "</head>";
    allMarkup += "<body>";
    allMarkup += htmlMarkup;
    allMarkup += "</body>";

    callback(null, allMarkup);
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
