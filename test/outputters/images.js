"use strict";

var should = require("should"),
  images = require("../../lib/outputters/images"),
  fs = require("fs-extra"),
  gm = require("gm"),
  opts;

describe("images", function () {
  before(function () {
    process.chdir(__dirname + "/..");
  });
  beforeEach(function (done) {
    opts = {
      pathToOutput: "./tmp",
      pathToImages: "images",
      loRes: false,
      loResDPI: 96,
      hiResDPI: 300
    };

    fs.mkdirp(opts.pathToOutput, done);
  });
  afterEach(function (done) {
    fs.remove(opts.pathToOutput, done);
  });
  it("should copy the images into the images folder", function (done) {
    images(opts, function (err) {
      should.not.exist(err);

      fs.readdir(opts.pathToOutput + "/" + opts.pathToImages, function (err, files) {
        should.not.exist(err);
        files.length.should.equal(3);
        done();
      });
    });
  });
  it("should resize the files if loRes is true", function (done) {
    opts.loRes = true;
    images(opts, function (err) {
      should.not.exist(err);

      gm(opts.pathToOutput + "/" + opts.pathToImages + "/mallard.png").size(function (err, size) {
        var targetWidth, targetHeight;
        should.not.exist(err);

        // size of images in test proj folder is 1280 x 800
        targetWidth = Math.floor(1280 * 96 / 300);
        targetHeight = Math.floor(800 * 96 / 300);

        size.width.should.equal(targetWidth);
        size.height.should.equal(targetHeight);

        done();
      });
    });
  });
});
