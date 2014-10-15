"use strict";

/*
* turns
*
* [{
*   content: "[...] ![something](something.png) [...]",
*   section: "body"
* }]
*
* to
*
* [{
*   content: "[...] ![something](path/to/images/something.png) [...]",
*   section: "body"
* }]
*
* because when things are rendered it'll need to look for the images in the right place
*
*/

var utils = require("../utils");

module.exports = function (pathToImages, chunks, callback) {
  chunks.forEach(function (chunk) {
    /*jslint regexp: true*/
    chunk.content = chunk.content.replace(/!\[(.*?)\]\((.*?)\)/g, "![$1](" + pathToImages + "/$2)");
    /*jslint regexp: false*/
  });

  utils.nextTick(callback, null, chunks);
};
