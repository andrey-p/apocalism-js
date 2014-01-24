/*jslint indent: 2, regexp: true, node: true*/
"use strict";

var fs = require("fs-extra"),
  gm = require("gm"),
  async = require("async"),
  path = require("path"),
  hiResDPI = 0,
  loResDPI = 0,
  arg = require("arg-err"),
  imageFormats = ["png", "jpg"];

function getDimensionForScreen(value) {

  if (!hiResDPI || !loResDPI) {
    throw new Error("images hasn't been initialised!");
  }

  return Math.floor(value * loResDPI / hiResDPI);
}

exports.saveImagesForScreen = function (sourceDir, destDir, callback) {

  function resizeAndSaveImage(img, callback) {
    gm(sourceDir + "/" + img)
      .size(function (err, size) {
        if (err) {
          callback(err);
          return;
        }

        this
          .resize(getDimensionForScreen(size.width), getDimensionForScreen(size.height))
          .write(destDir + "/" + img, function (err, result) {
            callback(err, result);
          });
      });
  }

  async.waterfall([
    function (callback) {
      fs.exists(destDir, function (result) {
        if (result) {
          callback();
        } else {
          fs.mkdir(destDir, callback);
        }
      });
    },
    async.apply(fs.readdir, sourceDir),
    function (files, callback) {
      files = files.filter(function (file) {
        return imageFormats.indexOf(path.extname(file).substr(1)) > -1;
      });
      async.each(files, resizeAndSaveImage, callback);
    }
  ], callback);
};

// args:
//  - css
//  - pathToImages
exports.resolveImagesInCss = function (args, callback) {
  var imageUrlRegex = /(?:url\()(\S+)(?:\))/g,
    match,
    matches = [],
    css = args.css,
    err = arg.err(args, {
      css: "string",
      pathToImages: "string"
    });

  if (err) {
    return callback(err);
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
//  - actualPathToImages
//  - replacementPathToImages
exports.resolveImageTag = function (args, callback) {
  var srcRegex = /(src=")(\S+)(")/,
    originalImagePath,
    extension,
    imgTag = args.imgTag,
    err = arg.err(args, {
      imgTag: "string",
      actualPathToImages: "string",
      replacementPathToImages: "string"
    });

  if (err) {
    return callback(err);
  }

  // strip <p> tags if present
  if (imgTag.indexOf("<p") === 0) {
    imgTag = args.imgTag.replace(/<(\/)?p>/g, "");
  }

  originalImagePath = imgTag.match(srcRegex)[2];
  extension = path.extname(originalImagePath).substr(1);
  imgTag = imgTag.replace(srcRegex, "$1" + args.replacementPathToImages + "$2$3");

  async.waterfall([
    async.apply(fs.readFile, args.actualPathToImages + originalImagePath),
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
//  - actualPathToImages
//  - replacementPathToImages
exports.resolveImagesInMarkup = function (args, callback) {
  var imageTagsRegex = /(<p>)?(<img[^>]*>)(<\/p>)?/g,
    match,
    imageTags = [],
    markup = args.markup,
    err = arg.err(args, {
      markup: "string",
      actualPathToImages: "string",
      replacementPathToImages: "string"
    });

  if (err) { return callback(err); }

  while (true) {
    match = imageTagsRegex.exec(markup);
    if (!match) {
      break;
    }
    imageTags.push(match[0]);
  }

  // if no images in markup, nothing to do
  if (imageTags.length === 0) {
    return callback(null, markup);
  }

  async.map(imageTags,
    function (imageTag, callback) {
      exports.resolveImageTag({
        imgTag: imageTag,
        actualPathToImages: args.actualPathToImages,
        replacementPathToImages: args.replacementPathToImages
      }, callback);
    },
    function (err, resolvedTags) {
      var i;

      for (i = 0; i < resolvedTags.length; i += 1) {
        markup = markup.replace(imageTags[i], resolvedTags[i]);
      }

      callback(err, markup);
    });
};

exports.init = function (options, callback) {
  hiResDPI = options.hiResDPI;
  loResDPI = options.loResDPI;
  callback();
};
