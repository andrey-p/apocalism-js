/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var fs = require("fs"),
  sass = require("node-sass"),
  async = require("async"),
  json2sass = require("json2sass"),
  handlebars = require("handlebars"),
  images = require("./images.js"),
  templateName,
  pathToImages,
  template,
  cssString;

function getUserDefinedStyle(path, callback) {
  fs.readFile(path, { encoding: "utf8" }, function (err, data) {
    if (err) {
      callback(null, "");
    } else {
      images.resolveImagesInCss(data, pathToImages, callback);
    }
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

exports.init = function (options, callback) {
  var dimensionsScss,
    fullScss;

  templateName = options.template;
  pathToImages = options.pathToImages;

  // convert dimensions vars to scss
  // they will be injected into style.scss
  dimensionsScss = json2sass.getContent({
    stock: options.stock,
    bleed: options.bleed,
    margin: options.margin
  }, "scss");

  async.waterfall([
    function (callback) {
      fs.readFile(__dirname + "/../template/" + templateName + ".hbs", { encoding: "utf-8" }, callback);
    },
    function (templateMarkup, callback) {
      template = handlebars.compile(templateMarkup);
      fs.readFile(__dirname + "/../template/style.scss", callback);
    },
    function (scss, callback) {
      fullScss = dimensionsScss + "\n\n" + scss;

      getUserDefinedStyle(process.cwd() + "/style.scss", callback);
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

exports.getBlankPage = function (data) {
  var htmlMarkup;

  if (!templateName) {
    throw new Error("template hasn't been initialised");
  }

  data = data || {};
  data.cssString = cssString;

  data.classes = data.classes || [];
  data.classes.push(templateName);

  htmlMarkup = template(data);

  return htmlMarkup;
};
