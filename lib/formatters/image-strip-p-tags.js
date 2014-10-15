"use strict";

/*
* turns
*
* [{
*   content: "<p><img src='foo/bar.png'/></p>",
*   section: "...",
*   classes: [...]
* }]
*
* to
*
* [{
*   content: "<img src='foo/bar.png'/>",
*   section: "...",
*   classes: [...]
* }]
*
* because having images inside paragraph tags can and will mess up styling
*/

var utils = require("../utils");

module.exports = function (chunks, callback) {
  /*jslint regexp: true*/
  var imageTagsRegex = /(<p[^>]*?>)(<img[^>]*?>)(<\/p>)/g;
  /*jslint regexp: false*/

  chunks.forEach(function (chunk) {
    chunk.content = chunk.content.replace(imageTagsRegex, "$2");
  });

  utils.nextTick(callback, null, chunks);
};
