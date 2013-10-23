/*jslint indent: 2, node: true*/
"use strict";

var fs = require("fs"),
  path = require("path");

exports.resolveToBase64ImageData = function (markup, pathToImages, callback) {
  var imageNamesRegex = /(?:img src=")(\S+)(?:")/g,
    match,
    imagePaths = [],
    currentImagePathIndex = 0,
    base64Strings = [];

  while (true) {
    match = imageNamesRegex.exec(markup);
    if (!match) {
      break;
    }
    imagePaths.push(match[1]);
  }

  // if no images in markup, nothing to do
  if (imagePaths.length === 0) {
    callback(null, markup);
    return;
  }

  function retrieveNextImageFile(err, fileData) {
    var imagePath,
      i;
    if (err) {
      callback(err);
      return;
    }

    if (fileData) {
      base64Strings.push("data:image/" + path.extname(imagePaths[currentImagePathIndex]).substr(1) + ";base64," + new Buffer(fileData, "binary").toString("base64"));
      currentImagePathIndex += 1;
    }

    if (currentImagePathIndex < imagePaths.length) {
      imagePath = pathToImages + imagePaths[currentImagePathIndex];
      fs.readFile(imagePath, retrieveNextImageFile);
    } else {
      for (i = 0; i < imagePaths.length; i += 1) {
        markup = markup.replace(imagePaths[i], base64Strings[i]);
      }

      callback(null, markup);
    }
  }

  retrieveNextImageFile();
};
