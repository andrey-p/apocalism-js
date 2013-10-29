/*jslint indent: 2, regexp: true, node: true*/
"use strict";

var fs = require("fs"),
  gm = require("gm"),
  path = require("path");

exports.resolveImageTag = function (imgTag, pathToImages, callback) {
  var srcRegex = /(src=")(\S+)(")/,
    originalImagePath,
    extension;

  // strip <p> tags if present
  if (imgTag.indexOf("<p") === 0) {
    imgTag = imgTag.replace(/<(\/)?p>/g, "");
  }

  originalImagePath = imgTag.match(srcRegex)[2];
  extension = path.extname(originalImagePath).substr(1);

  function gotImageDimensions(err, size) {
    var targetWidth, targetHeight, idName;
    if (err) {
      callback(err);
      return;
    }

    // these numbers were obtained through crazy trial and error
    // there's currently a bug with the phantomjs pdf rendering
    // where pdfs don't come out the right size
    // more info here: https://github.com/ariya/phantomjs/issues/11590
    //
    // more sane solution to come when the phantomjs bug is fixed too

    targetWidth = Math.floor((size.width + 3) * 72 / 300 * 1.5);
    targetHeight = Math.floor((size.height + 3) * 72 / 300 * 1.5);

    if (imgTag.indexOf("width=") > -1) {
      imgTag = imgTag.replace(/width="\d*"/, "width=\"" + targetWidth + "\"");
    } else {
      imgTag = imgTag.replace("/>", "width=\"" + targetWidth + "\" />");
    }

    if (imgTag.indexOf("height=") > -1) {
      imgTag = imgTag.replace(/height="\d*"/, "height=\"" + targetHeight + "\"");
    } else {
      imgTag = imgTag.replace("/>", "height=\"" + targetHeight + "\" />");
    }

    if (imgTag.indexOf("id=") === -1) {
      idName = "image-" + originalImagePath.replace(".png", "");
      imgTag = imgTag.replace("/>", "id=\"" + idName + "\" />");
    }

    callback(null, imgTag);
  }

  function gotImageData(err, data) {
    if (err) {
      callback(err);
      return;
    }

    imgTag = imgTag.replace(srcRegex, "$1data:image/" + extension
        + ";base64," + data.toString("base64")
        + "$3");

    gm(data, "image." + extension).size(gotImageDimensions);
  }

  fs.readFile(pathToImages + originalImagePath, gotImageData);
};

exports.resolveImagesInMarkup = function (markup, pathToImages, callback) {
  var imageTagsRegex = /(<p>)?(<img[^>]*>)(<\/p>)?/g,
    match,
    imageTag,
    imageTags = [];

  while (true) {
    match = imageTagsRegex.exec(markup);
    if (!match) {
      break;
    }
    imageTags.push(match[0]);
  }

  // if no images in markup, nothing to do
  if (imageTags.length === 0) {
    callback(null, markup);
    return;
  }

  function resolvedImageTag(err, resolvedTag) {
    if (err) {
      callback(err);
      return;
    }

    markup = markup.replace(imageTag, resolvedTag);

    if (imageTags.length === 0) {
      callback(null, markup);
      return;
    }

    imageTag = imageTags.shift();

    exports.resolveImageTag(imageTag, pathToImages, resolvedImageTag);
  }

  imageTag = imageTags.shift();

  exports.resolveImageTag(imageTag, pathToImages, resolvedImageTag);
};
