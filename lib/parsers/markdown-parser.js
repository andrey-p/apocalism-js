"use strict";

var he = require("he"),
  MarkdownIt = require("markdown-it"),
  classy = require("markdown-it-classy"),
  typogr = require("typogr");

/*jslint regexp:true*/
function capify(text) {
  return text.replace(/(<p.*?class=".*?opening.*?">\W?)(\w)/, "$1<span class=\"cap\">$2</span>");
}
/*jslint regexp:false*/

exports.parseMarkdown = function (markdown) {
  var md = new MarkdownIt(),
    markup;

  md.use(classy);

  markup = md.render(markdown);

  // decode html entities as typogr misses them otherwise
  markup = he.decode(markup);

  markup = capify(markup);

  // typographic fanciness
  if (markup.length) {
    markup = typogr.typogrify(markup);
  }

  return markup;
};
