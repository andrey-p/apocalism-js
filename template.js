/*jslint indent: 2, node: true*/
"use strict";

var dimensions = require("./dimensions.js"),
  stock = dimensions.stock,
  margin = dimensions.margin;

exports.getNewEmptyPageMarkup = function (args) {
  var htmlMarkup,
    dimensionsInlineCss,
    width = stock.width + stock.bleed * 2 - (margin.outer + margin.spine),
    height = stock.height + stock.bleed * 2 - (margin.top + margin.bottom);

  dimensionsInlineCss = "width:" + width + "mm;"
    + "height:" + height + "mm;"
    + "margin:" + margin.top + "mm " + margin.spine + "mm " + margin.bottom + "mm " + margin.outer + "mm;";

  htmlMarkup = "<html>";
  htmlMarkup += "<head>";
  if (args && args.headMarkup) {
    htmlMarkup += args.headMarkup;
  }
  if (args && args.css) {
    htmlMarkup += "<style type='text/css'>" + args.css + "</style>";
  }
  htmlMarkup += "</head>";
  htmlMarkup += "<body style='" + dimensionsInlineCss + "'>";
  htmlMarkup += "<div id='container' style='width: 100%; height: 100%; overflow: hidden;'>";
  htmlMarkup += "</div>";
  htmlMarkup += "</body>";
  htmlMarkup += "</html>";

  return htmlMarkup;
};
