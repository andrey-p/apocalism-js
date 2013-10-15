/*jslint indent: 2, node: true*/
"use strict";

var namp = require("namp"),
  fs = require("fs"),
  sass = require("node-sass"),
  paginator = require("./paginator.js"),
  ent = require("ent"),
  typogr = require("typogr"),
  template = require("./template.js");

exports.generateAndPrepMarkup = function (markdown) {
  var markup;

  // markup to html
  markup = namp(markdown).html;

  // add 'opening' class to the first paragraph; this might be pretty brittle
  markup = markup.replace(/<p>/, "<p class=\"opening\">");

  // decode html entities as typogr misses them otherwise
  markup = ent.decode(markup);

  // typographic fanciness
  markup = typogr.typogrify(markup);

  return markup;
};

exports.generateFromMarkdown = function (bodyMarkdown, callback) {
  var bodyMarkup;

  function initialisedTemplate(err) {
    if (err) {
      callback(err);
      return;
    }

    paginator.paginate(template.getBlankPage(), bodyMarkup, callback);
  }

  bodyMarkup = exports.generateAndPrepMarkup(bodyMarkdown);

  template.init("default", initialisedTemplate);
};
