"use strict";

var gm = require("gm"),
  fs = require("fs-extra"),
  utils = require("../utils"),
  path = require("path"),
  arg = require("arg-err"),
  supportedImages = require("../common-data/supported-image-formats"),
  async = require("async");

function getImageDimension(value, sourceDPI, targetDPI) {
  return Math.floor(value * targetDPI / sourceDPI);
}

function copyImageToOutput(opts, file, callback) {
  // not an image, ignore
  var extension = path.extname(file).substr(1);
  if (supportedImages.indexOf(extension) === -1) {
    return utils.nextTick(callback);
  }

  gm(opts.pathToImages + "/" + file)
    .size({ bufferStream: true }, function (err, size) {
      if (err) { return callback(err); }

      if (opts.loRes) {
        this.resize(
          getImageDimension(size.width, opts.hiResDPI, opts.loResDPI),
          getImageDimension(size.height, opts.hiResDPI, opts.loResDPI)
        );
      }

      this.write(opts.pathToOutput
        + "/" + opts.pathToImages
        + "/" + file, callback);
    });
}

module.exports = function (opts, callback) {
  var err = arg.err(opts, {
    pathToOutput: "string",
    pathToImages: "string",
    loRes: "boolean",
    loResDPI: "number",
    hiResDPI: "number"
  });

  if (err) {
    return utils.nextTick(callback, err);
  }

  /*jslint unparam: true*/
  async.waterfall([
    async.apply(fs.mkdirp, opts.pathToOutput + "/" + opts.pathToImages),
    function (dirCreated, callback) {
      fs.readdir(opts.pathToImages, callback);
    },
    function (files, callback) {
      async.forEach(files,
        async.apply(copyImageToOutput, opts),
        callback);
    }
  ], callback);
  /*jslint unparam: false*/
};
