/*jslint indent: 2, node: true*/
"use strict";

var sass = require("node-sass"),
  ent = require("ent"),
  typogr = require("typogr");

exports.prepMarkup = function (markup) {
  // add 'opening' class to the first paragraph; this might be pretty brittle
  markup = markup.replace(/<p>/, "<p class=\"opening\">");

  // decode html entities as typogr misses them otherwise
  markup = ent.decode(markup);

  // typographic fanciness
  markup = typogr.typogrify(markup);

  return markup;
};