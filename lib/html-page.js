"use strict";

var handlebars = require("handlebars"),
  fs = require("fs-extra"),
  arg = require("arg-err"),
  async = require("async"),
  templateDir = __dirname + "/assets/templates/",
  templates = ["page.hbs", "pages.hbs"],
  partials = ["_page.hbs"],
  css,
  compiledTemplates;

exports.getPageForPagination = function (args) {
  args = args || {};
  args.css = css;
  return compiledTemplates.page(args);
};

exports.getPages = function (args) {
  return compiledTemplates.pages(args);
};

function loadPartials(callback) {
  var partialLoaders = {},
    partialName;

  partials.forEach(function (partial) {
    // "_page.hbs" => "page"
    partialName = partial.substring(1, partial.indexOf("."));
    partialLoaders[partialName] = async.apply(fs.readFile, templateDir + partial);
  });

  async.parallel(partialLoaders, function (err, results) {
    if (err) { return callback(err); }

    Object.keys(results).forEach(function (key) {
      handlebars.registerPartial(key, results[key].toString());
    });

    callback();
  });
}

function loadTemplates(callback) {
  var templateLoaders = {},
    templateName;

  templates.forEach(function (template) {
    // "page.hbs" => "page"
    templateName = template.substr(0, template.indexOf("."));
    templateLoaders[templateName] = async.apply(fs.readFile, templateDir + template);
  });

  async.parallel(templateLoaders, function (err, results) {
    if (err) { return callback(err); }

    Object.keys(results).forEach(function (key) {
      compiledTemplates[key] = handlebars.compile(results[key].toString());
    });

    callback();
  });
}

exports.init = function (options, callback) {
  css = options.css;
  compiledTemplates = {};

  async.series([
    loadPartials,
    loadTemplates
  ], callback);
};
