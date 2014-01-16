/*jslint indent: 2, node: true*/
"use strict";

var sass = require("node-sass"),
  ent = require("ent"),
  marked = require("marked"),
  typogr = require("typogr");

exports.fromMarkdown = function (markdown) {
  var markup = marked(markdown);

  // add 'opening' class to the first paragraph; this might be pretty brittle
  markup = markup.replace(/<p>/, "<p class=\"opening\">");

  // decode html entities as typogr misses them otherwise
  markup = ent.decode(markup);

  // typographic fanciness
  markup = typogr.typogrify(markup);

  return markup;
};

// currently assumes that body has no class
// this might cause problems down the line?
exports.getBodyContent = function (markup) {
  var startIndex = markup.indexOf("<body>") + 6,
    endIndex = markup.indexOf("</body>");
  return markup.slice(startIndex, endIndex);
};
