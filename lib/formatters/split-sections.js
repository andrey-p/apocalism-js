"use strict";

/*
* turns
*
* [{
*   content: "part 1\n\n===\n\npart2",
*   section: "body"
* }]
*
* to
*
* [{
*   content: "part 1",
*   section: "body"
* },{
*   content: "part2",
*   section: "body"
* }]
*
* because three or more equal signs surrounded by blank lines
* should be interpreted as a page break
*
*/
var utils = require("../utils");

module.exports = function (sections, callback) {
  var splitSections = [];

  sections.forEach(function (section) {
    var parts = section.content.split(/\n\n={3,}\n\n/);
    parts.forEach(function (part) {
      splitSections.push({ content: part, section: section.section });
    });
  });

  utils.nextTick(callback, null, splitSections);
};
