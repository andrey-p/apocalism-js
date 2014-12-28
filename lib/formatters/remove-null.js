"use strict";

/*
* turns
*
* [{
*   content: "lorem ipsum",
*   section: "body"
* },{
*   content: null,
*   section: "back-matter"
* }]
*
* to
*
* [{
*   content: "lorem ipsum",
*   section: "body"
* }]
*
* because missing files come back as null
* and we want to filter them out
*
*/

var utils = require("../utils");

module.exports = function (sections, callback) {
  var notNullSections = [];

  sections.forEach(function (section) {
    if (section.content !== null) {
      notNullSections.push(section);
    }
  });

  utils.nextTick(callback, null, notNullSections);
};
