/*jslint indent: 2, node: true*/
"use strict";

var namp = require("namp"),
  sass = require("node-sass"),
  ent = require("ent"),
  typogr = require("typogr");

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
