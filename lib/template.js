/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var fs = require("fs"),
  sass = require("node-sass"),
  async = require("async"),
  json2sass = require("json2sass"),
  templateName,
  cssString;

function getFileContentsOrEmptyString(path, callback) {
  fs.readFile(path, { encoding: "utf8" }, function (err, data) {
    if (err) {
      data = "";
    }

    callback(null, data);
  });
}

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
    margin,
    fullScss;

  templateName = template;
  stock = dimensions.stock;
  margin = dimensions.margin;

  // convert dimensions vars to scss
  // they will be injected into style.scss
  dimensionsScss = json2sass.getContent(dimensions, "scss");

  async.waterfall([
    function (callback) {
      fs.readFile(__dirname + "/../template/" + templateName + "/style.scss", callback);
    },
    function (scss, callback) {
      fullScss = dimensionsScss + "\n\n" + scss;

      getFileContentsOrEmptyString(process.cwd() + "/style.scss", callback);
    },
    function (scss, callback) {
      fullScss += "\n\n" + scss;

      parseStyle(fullScss, callback);
    }
  ], function (err, css) {
    cssString = css;
    callback();
  });
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
