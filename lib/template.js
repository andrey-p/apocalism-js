"use strict";

var fs = require("fs-extra"),
  sass = require("node-sass"),
  async = require("async"),
  json2sass = require("json2sass"),
  handlebars = require("handlebars"),
  images = require("./images.js"),
  hasBeenInitialised = false,
  templates = {
    page: null,
    html_layout: null
  },
  pathToImages,
  pathToTemplateDir = __dirname + "/../template/",
  cssString;

function getUserDefinedStyle(path, callback) {
  fs.readFile(path, { encoding: "utf8" }, function (err, data) {
    if (err) { return callback(null, ""); }

    images.resolveImagesInCss({
      css: data,
      pathToImages: pathToImages
    }, callback);
  });
}

function parseStyle(data, callback) {
  sass.render({
    data: data,
    outputStyle: "compressed",
    includePaths: [pathToTemplateDir],
    success: function (css) {
      callback(null, css);
    },
    error: function (err) {
      callback(err);
    }
  });
}

function getTemplates(callback) {
  var templateNames = Object.keys(templates);
  async.map(templateNames,
    function (templateName, callback) {
      fs.readFile(pathToTemplateDir + templateName + ".hbs", { encoding: "utf-8" }, callback);
    },
    function (err, results) {
      var i;
      if (err) { return callback(err); }

      for (i = 0; i < results.length; i += 1) {
        templates[templateNames[i]] = handlebars.compile(results[i]);
      }

      callback();
    });
}

exports.init = function (options, callback) {
  var scssVars,
    fullScss;

  pathToImages = options.pathToImages;

  // convert dimensions vars to scss
  // they will be injected into style.scss
  scssVars = json2sass.getContent({
    stock: options.stock,
    bleed: options.bleed,
    margin: options.margin
  }, "scss");

  async.waterfall([
    getTemplates,
    async.apply(fs.readFile, pathToTemplateDir + "/style.scss"),
    function (scss, callback) {
      fullScss = scssVars + "\n\n" + scss;

      getUserDefinedStyle(process.cwd() + "/style.scss", callback);
    },
    function (scss, callback) {
      fullScss += "\n\n" + scss;

      parseStyle(fullScss, callback);
    }
  ], function (err, css) {
    if (err) { return callback(err); }

    cssString = css;
    hasBeenInitialised = true;
    callback();
  });
};

exports.getTemplatePage = function (templateName, data) {
  if (!hasBeenInitialised) {
    throw new Error("template hasn't been initialised");
  }

  return templates[templateName](data);
};

exports.getBlankPage = function (templateName, data) {
  if (!hasBeenInitialised) {
    throw new Error("template hasn't been initialised");
  }

  data = data || {};
  data.cssString = cssString;

  data.classes = data.classes || [];
  data.classes.push(templateName);

  return exports.getTemplatePage(templateName, data);
};

exports.saveStyleAssetsToDir = function (targetDir, callback) {
  if (!hasBeenInitialised) {
    throw new Error("template hasn't been initialised");
  }

  fs.writeFile(targetDir + "/style.css", cssString, callback);
};
