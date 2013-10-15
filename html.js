/*jslint indent: 2, node: true*/
"use strict";

var namp = require("namp"),
  fs = require("fs"),
  sass = require("node-sass"),
  paginator = require("./paginator.js"),
  ent = require("ent"),
  typogr = require("typogr"),
  template = require("./template.js");

exports.generateFromMarkdown = function (bodyMarkdown, callback) {
  var bodyMarkup;

  function initialisedTemplate(err) {
    if (err) {
      callback(err);
      return;
    }

    paginator.paginate(template.getBlankPage(), bodyMarkup, callback);
  }

  // markup to html
  bodyMarkup = namp(bodyMarkdown).html;

  // add 'opening' class to the first paragraph; this might be pretty brittle
  bodyMarkup = bodyMarkup.replace(/<p>/, "<p class=\"opening\">");

  // decode html entities as typogr misses them otherwise
  bodyMarkup = ent.decode(bodyMarkup);

  // typographic fanciness
  bodyMarkup = typogr.typogrify(bodyMarkup);

  template.init("default", initialisedTemplate);
};
