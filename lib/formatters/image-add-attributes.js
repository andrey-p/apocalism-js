"use strict";

/*
* turns
*
* [{
*   content: "[...] <img src='foo/bar.png'/> [...]",
*   section: "...",
*   classes: [...]
* }]
*
* to
*
* [{
*   content: "[...] <img width='500' height='200' src='foo/bar.png'/> [...]",
*   section: "...",
*   classes: [...]
* }]
*
* because high-res images still need to be resized down to a certain size
* to fit onto the page
*
* for low-res images, the width and height will be the actual ones for that image
*/

var async = require("async"),
  gm = require("gm"),
  arg = require("arg-err"),
  path = require("path"),
  utils = require("../utils");

function getImageDimension(value, sourceDPI, targetDPI) {
  return Math.floor(value * targetDPI / sourceDPI);
}

function addAttributesForTag(opts, tag, callback) {
  var srcRegex = /(src=")(\S+)(")/,
    imagePath = tag.match(srcRegex)[2],
    imgName = path.basename(imagePath, path.extname(imagePath)),
    sourceDPI = opts.hiResDPI,
    targetDPI = opts.loResDPI;

  gm(imagePath).size(function (err, size) {
    if (err) { return callback(err); }

    tag = tag.replace("<img ", "<img width=\""
      + getImageDimension(size.width, sourceDPI, targetDPI) + "\" ");
    tag = tag.replace("<img ", "<img height=\""
      + getImageDimension(size.height, sourceDPI, targetDPI) + "\" ");
    tag = tag.replace("<img ", "<img class=\"image-" + imgName + "\" ");

    callback(null, tag);
  });
}

function addImageAttributesForChunk(opts, chunk, callback) {
  /*jslint regexp: true*/
  var imageTagsRegex = /<img[^>]*?>/g,
    match,
    imageTags = [],
    content = chunk.content;
  /*jslint regexp: false*/

  while (true) {
    match = imageTagsRegex.exec(content);
    if (!match) {
      break;
    }

    imageTags.push(match[0]);
  }

  // no images in chunk, nothing to do
  if (imageTags.length === 0) {
    return utils.nextTick(callback, null, chunk);
  }

  async.map(imageTags,
    async.apply(addAttributesForTag, opts),
    function (err, updatedTags) {
      if (err) {
        return callback(err);
      }

      updatedTags.forEach(function (updatedTag, i) {
        chunk.content = chunk.content.replace(imageTags[i], updatedTag);
      });

      callback(null, chunk);
    });
}

module.exports = function (opts, chunks, callback) {
  var err = arg.err(opts, {
    hiResDPI: "number",
    loResDPI: "number"
  });

  if (err) { return utils.nextTick(callback, err); }

  async.forEach(chunks,
    async.apply(addImageAttributesForChunk, opts),
    function (err) {
      callback(err, chunks);
    });
};
