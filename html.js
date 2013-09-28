/*jslint indent: 2, node: true*/
"use strict";

var pandoc = require("pdc"),
  fs = require("fs"),
  sass = require("node-sass"),
  stock = require("./dimensions.js").stock,
  margin = require("./dimensions.js").margin;

function getNewEmptyPageMarkup(args) {
  var htmlMarkup,
    dimensionsInlineCss,
    width = stock.width + stock.bleed * 2 - (margin.outer + margin.spine),
    height = stock.height + stock.bleed * 2 - (margin.top + margin.bottom);

  dimensionsInlineCss = "width:" + width + "mm;"
    + "height:" + height + "mm;"
    + "margin:" + margin.top + "mm " + margin.spine + "mm " + margin.bottom + "mm " + margin.outer + "mm;";

  htmlMarkup = "<html>";
  htmlMarkup += "<head>";
  if (args.headMarkup) {
    htmlMarkup += args.headMarkup;
  }
  if (args.css) {
    htmlMarkup += "<style type='text/css'>" + args.css + "</style>";
  }
  htmlMarkup += "</head>";
  htmlMarkup += "<body style='" + dimensionsInlineCss + "'>";
  htmlMarkup += "<div id='container' style='width: 100%; height: 100%; oveflow: hidden;'>";
  htmlMarkup += "</div>";
  htmlMarkup += "</body>";
  htmlMarkup += "</html>";

  return htmlMarkup;
}

// args at this point:
// - bodyMarkup (required)
// - headMarkup (optional)
// - css (optional)
exports.paginate = function (args, callback) {
  var htmlMarkup,
    pages = [];

  if (!args.bodyMarkup) {
    callback("bodyMarkup wasn't passed in");
    return;
  }

  function beginNewPage(markup) {

  }

  beginNewPage(args.bodyMarkup);
};

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
