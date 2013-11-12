/*jslint indent: 2, regexp: true, node: true*/
"use strict";

var fs = require("fs"),
  gm = require("gm"),
  async = require("async"),
  path = require("path");

exports.resolveImagesInCss = function (css, pathToImages, callback) {
  var imageUrlRegex = /(?:url\()(\S+)(?:\))/g,
    match,
    matches = [];

  while (true) {
    match = imageUrlRegex.exec(css);
    if (!match) {
      break;
    }
    matches.push(match[1]);
  }

  matches.forEach(function (match) {
    css = css.replace(match, "file://" + path.resolve(pathToImages) + "/" + match);
  });

  callback(null, css);
};

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
  imgTag = imgTag.replace(srcRegex, "$1file://" + path.resolve(pathToImages) + "/$2$3");

  async.waterfall([
    function (callback) {
      fs.readFile(pathToImages + originalImagePath, callback);
    },
    function (data, callback) {
      gm(data, "image." + extension).size(callback);
    },
    function (size, callback) {
      var targetWidth, targetHeight, className;

      // these numbers were obtained through crazy trial and error
      // there's currently a bug with the phantomjs pdf rendering
      // where pdfs don't come out the right size
      // more info here: https://github.com/ariya/phantomjs/issues/11590
      //
      // more sane solution to come when the phantomjs bug is fixed too

      targetWidth = Math.floor((size.width + 3) * 72 / 300 * 1.5);
      targetHeight = Math.floor((size.height + 3) * 72 / 300 * 1.5);

      // namp seems to output non-self closing img tags
      // not cool, namp
      if (imgTag.indexOf("/>") === -1) {
        imgTag = imgTag.replace(">", "/>");
      }

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

      className = "image-" + originalImagePath.replace(".png", "");

      if (imgTag.indexOf("class=") === -1) {
        imgTag = imgTag.replace("/>", "class=\"" + className + "\" />");
      } else {
        imgTag = imgTag.replace("class=\"", "class=\"" + className + " ");
      }

      callback(null, imgTag);
    }
  ], callback);
};

exports.resolveImagesInMarkup = function (markup, pathToImages, callback) {
  var imageTagsRegex = /(<p>)?(<img[^>]*>)(<\/p>)?/g,
    match,
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

  async.each(imageTags,
    function (imageTag, callback) {
      exports.resolveImageTag(imageTag, pathToImages, function (err, resolvedTag) {
        if (err) {
          callback(err);
          return;
        }

        markup = markup.replace(imageTag, resolvedTag);
        callback();
      });
    },
    function (err) {
      callback(err, markup);
    });
};
