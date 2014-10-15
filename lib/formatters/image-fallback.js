"use strict";

/*
* turns
*
* [{
*   content: "",
*   section: "front-cover"
* }]
*
* to
*
* [{
*   content: "![front-cover](front-cover.png)",
*   section: "front-cover"
* }]
*
* because some pages should fall back to an image with the same name
* if there's no content (but only if the images exist in image folder)
*
*/
var async = require("async"),
  path = require("path"),
  fs = require("fs-extra"),
  utils = require("../utils"),
  imageFallbackSections = require("../common-data/image-fallback-sections"),
  supportedImageFormats = require("../common-data/supported-image-formats");

module.exports = function (pathToImages, chunks, callback) {

  function addImageIfExists(chunk, callback) {
    // leave sections not in the image fallback list as they are
    if (imageFallbackSections.indexOf(chunk.section) === -1) {
      return utils.nextTick(callback, null, chunk);
    }

    var filesToCheck = supportedImageFormats.map(function (format) {
      return pathToImages + "/" + chunk.section + "." + format;
    });

    async.filter(filesToCheck, fs.exists, function (files) {
      if (files.length) {
        // use the first file that was found
        chunk.content = "!["
          + chunk.section + "]("
          + path.basename(files[0])
          + ")";
      }

      // if no files were found, leave as-is

      utils.nextTick(callback, null, chunk);
    });
  }

  async.map(chunks,
    addImageIfExists,
    callback);
};
