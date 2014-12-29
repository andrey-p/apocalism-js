"use strict";

/*
* turns
*
* [{
*   content: "something",
*   section: "back-matter"
* },{
*   content: "# hello\n\nlorem ipsum",
*   section: "body"
* }]
*
* to
*
* [{
*   content: "something",
*   section: "back-matter"
* },{
*   content: "# hello\n\nlorem ipsum\n{opening}",
*   section: "body"
* }]
*
* because the opening paragraph needs to be marked
* for dropcap styling purposes
*
*/

var utils = require("../utils");

module.exports = function (sections, callback) {
  sections.forEach(function (section) {
    if (section.section !== "body") {
      return;
    }

    var paragraphs,
      updatedFirstPara;

    paragraphs = section.content.split("\n\n")
      .filter(function (chunk) {
        return chunk.indexOf(">") !== 0
          && chunk.indexOf("- ") !== 0
          && chunk.indexOf("#") !== 0
          && chunk.indexOf("!") !== 0
          && !chunk.match(/\n[=\-]+$/);
      });

    if (!paragraphs.length) {
      return;
    }

    updatedFirstPara = paragraphs[0];

    if (updatedFirstPara[updatedFirstPara.length - 1] === "}") {
      updatedFirstPara = updatedFirstPara.replace("}", " opening}");
    } else {
      updatedFirstPara = updatedFirstPara + "\n{opening}";
    }

    section.content = section.content
      .replace(paragraphs[0], updatedFirstPara);
  });

  utils.nextTick(callback, null, sections);
};
