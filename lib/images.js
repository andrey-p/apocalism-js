/*jslint indent: 2, regexp: true, node: true*/
"use strict";

var fs = require("fs"),
  gm = require("gm"),
  async = require("async"),
  path = require("path");

// these numbers were obtained through crazy trial and error
// there's currently a bug with the phantomjs pdf rendering
// where pdfs don't come out the right size
// more info here: https://github.com/ariya/phantomjs/issues/11590
//
// more sane solution to come when the phantomjs bug is fixed too

function getDimensionForScreen(value) {
  return Math.floor((value + 3) * 72 / 300 * 1.5);
}

// args:
//  - css
//  - pathToImages
exports.resolveImagesInCss = function (args, callback) {
  var imageUrlRegex = /(?:url\()(\S+)(?:\))/g,
    match,
    matches = [],
    css = args.css;

  if (typeof args.css === "undefined"
      || typeof args.pathToImages === "undefined") {
    callback("args needs to specify css and pathToImages");
    return;
  }

  while (true) {
    match = imageUrlRegex.exec(css);
    if (!match) {
      break;
    }
    matches.push(match[1]);
  }

  matches.forEach(function (match) {
    css = css.replace(match, args.pathToImages + match);
  });

  callback(null, css);
};

// args:
//  - imgTag
//  - pathToImages
exports.resolveImageTag = function (args, callback) {
  var srcRegex = /(src=")(\S+)(")/,
    originalImagePath,
    extension,
    imgTag = args.imgTag;

  if (typeof args.imgTag === "undefined"
      || typeof args.pathToImages === "undefined") {
    callback("args needs to specify imgTag and pathToImages");
    return;
  }

  // strip <p> tags if present
  if (imgTag.indexOf("<p") === 0) {
    imgTag = args.imgTag.replace(/<(\/)?p>/g, "");
  }

  originalImagePath = imgTag.match(srcRegex)[2];
  extension = path.extname(originalImagePath).substr(1);
  imgTag = imgTag.replace(srcRegex, "$1" + args.pathToImages + "$2$3");

  async.waterfall([
    function (callback) {
      fs.readFile(args.pathToImages + originalImagePath, callback);
    },
    function (data, callback) {
      gm(data, "image." + extension).size(callback);
    },
    function (size, callback) {
      var targetWidth, targetHeight, className;

      targetWidth = getDimensionForScreen(size.width);
      targetHeight = getDimensionForScreen(size.height);

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

// args:
//  - markup
//  - pathToImages
exports.resolveImagesInMarkup = function (args, callback) {
  var imageTagsRegex = /(<p>)?(<img[^>]*>)(<\/p>)?/g,
    match,
    imageTags = [],
    markup = args.markup;

  if (typeof args.markup === "undefined"
      || typeof args.pathToImages === "undefined") {
    callback("args needs to specify markup and pathToImages");
    return;
  }

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
      exports.resolveImageTag({
        imgTag: imageTag,
        pathToImages: args.pathToImages
      }, function (err, resolvedTag) {
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
