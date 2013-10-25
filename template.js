/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var fs = require("fs"),
  sass = require("node-sass"),
  json2sass = require("json2sass"),
  templateName,
  cssString;

function parseStyle(data, callback) {
  sass.render({
    data: data,
    success: function (css) {
      callback(null, css);
    },
    error: function (err) {
      callback(err);
    }
  });
}

exports.init = function (template, dimensions, callback) {
  var dimensionsScss,
    stock,
    margin;

  templateName = template;
  stock = dimensions.stock;
  margin = dimensions.margin;

  // convert dimensions vars to scss
  // they will be injected into style.scss
  dimensionsScss = json2sass.writeScss(dimensions);

  function parsedStyle(err, css) {
    if (err) {
      callback(err);
      return;
    }

    cssString = css;

    callback();
  }

  function gotStyle(err, scss) {
    if (err) {
      callback(err);
      return;
    }

    scss = dimensionsScss + "\n\n" + scss;

    parseStyle(scss, parsedStyle);
  }

  fs.readFile(__dirname + "/template/" + templateName + "/style.scss", gotStyle);
};

exports.getBlankPage = function (opts) {
  var htmlMarkup;

  if (!templateName) {
    throw new Error("template hasn't been initialised");
  }

  htmlMarkup = "<!DOCTYPE html>";
  htmlMarkup += "<html>";
  htmlMarkup += "<head>";
  htmlMarkup += "<title>apocalism.js page</title>";
  htmlMarkup += "<style type='text/css'>" + cssString + "</style>";
  htmlMarkup += "</head>";
  htmlMarkup += "<body class='" + (opts && opts.className ? opts.className : "") + "'>";
  htmlMarkup += "<div id='container'>";
  htmlMarkup += "</div>";
  if (opts && opts.pageNumber) {
    htmlMarkup += "<div id='page-number'>" + opts.pageNumber + "</div>";
  }
  htmlMarkup += "</body>";
  htmlMarkup += "</html>";

  return htmlMarkup;
};
