/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var fs = require("fs"),
  sass = require("node-sass"),
  templateName,
  stock,
  margin,
  cssString;

function getStyle(path, callback) {
  sass.render({
    file: path,
    success: function (css) {
      callback(null, css);
    },
    error: function (err) {
      callback(err);
    }
  });
}

exports.init = function (template, callback) {
  var dimensions;

  templateName = template;
  dimensions = require("./template/" + templateName + "/dimensions.js");
  exports.stock = stock = dimensions.stock;
  exports.margin = margin = dimensions.margin;

  getStyle("./template/" + templateName + "/style.scss", function (err, css) {
    if (err) {
      callback(err);
      return;
    }

    cssString = css;

    callback();
  });
};

exports.getBlankPage = function (classString) {
  var htmlMarkup,
    dimensionsInlineCss,
    width,
    height;

  if (!templateName) {
    throw new Error("template hasn't been initialised");
  }

  width = stock.width + stock.bleed * 2 - (margin.outer + margin.spine);
  height = stock.height + stock.bleed * 2 - (margin.top + margin.bottom);

  dimensionsInlineCss = "width:" + width + "mm;"
    + "height:" + height + "mm;"
    + "margin:" + margin.top + "mm " + margin.spine + "mm " + margin.bottom + "mm " + margin.outer + "mm;";

  htmlMarkup = "<html>";
  htmlMarkup += "<head>";
  htmlMarkup += "<style type='text/css'>" + cssString + "</style>";
  htmlMarkup += "</head>";
  htmlMarkup += "<body style='" + dimensionsInlineCss + "' class='" + classString + "'>";
  htmlMarkup += "<div id='container' style='width: 100%; height: 100%; overflow: hidden;'>";
  htmlMarkup += "</div>";
  htmlMarkup += "</body>";
  htmlMarkup += "</html>";

  return htmlMarkup;
};
