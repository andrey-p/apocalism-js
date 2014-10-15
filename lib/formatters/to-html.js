"use strict";

/*
* turns
*
* [{
*   content: "# heading\n\npara1\n\npara2",
*   section: "body"
* }]
*
* to
*
* [{
*   content: "<h1>heading</h1><p>para1</p><p>para2</p>",
*   classes: ["body"],
*   section: "body"
* }]
*
* because we need to get to html at some point
*
* the addition of classes is because at this point
* we start thinking in terms of page-containing divs
* rather than sections of the book
* and the section name is used as a styling hook
*
*/

var markdownParser = require("../parsers/markdown-parser"),
  utils = require("../utils");

module.exports = function (chunks, callback) {
  var htmlChunks = chunks.map(function (chunk) {
    return {
      content: markdownParser.parseMarkdown(chunk.content),
      classes: [chunk.section],
      section: chunk.section
    };
  });

  utils.nextTick(callback, null, htmlChunks);
};
