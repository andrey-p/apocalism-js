/*jslint indent: 2, node: true*/
"use strict";

var pandoc = require("pdc"),
  fs = require("fs"),
  sass = require("node-sass");

exports.generateFromMarkdown = function (markdown, callback) {
  var headMarkup,
    bodyMarkup;

  function convertedSassToCss(err, result) {
    var styleTag,
      allMarkup;
    if (err) {
      callback(err);
      return;
    }

    styleTag = "<style type='text/css'>" + result + "</style>";

    allMarkup = "<head>";
    allMarkup += headMarkup;
    allMarkup += styleTag;
    allMarkup += "</head>";
    allMarkup += "<body>";
    allMarkup += bodyMarkup;
    allMarkup += "</body>";

    callback(null, allMarkup);
  }

  function gotHeadMarkup(err, result) {
    if (err) {
      callback(err);
      return;
    }

    headMarkup = result;

    sass.render({
      file: "./template/style.scss",
      success: function (css) {
        convertedSassToCss(null, css);
      },
      error: function (err) {
        convertedSassToCss(err);
      }
    });
  }

  function convertedMarkdownToHtml(err, result) {
    if (err) {
      callback(err);
      return;
    }

    bodyMarkup = result;

    fs.readFile("./template/head.html", { encoding: "utf-8" }, gotHeadMarkup);
  }
  pandoc(markdown, "markdown", "html", convertedMarkdownToHtml);
};
