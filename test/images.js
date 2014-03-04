/*jslint indent: 2, node: true, nomen: true*/
/*globals it, describe, beforeEach, afterEach, after, before*/
"use strict";

var should = require("should"),
  fs = require("fs-extra"),
  monkey = require("monkey-patch"),
  images = require("../lib/images.js"),
  pathToAssets = __dirname + "/images/",
  pathToTmp = __dirname + "/tmp/",
  helper = require("./helper.js"),
  opts = helper.getDefaultOpts();

describe("images", function () {

  before(function (done) {
    images.init(opts, function () {
      done();
    });
  });

  describe("#saveImagesForScreen()", function () {
    after(function (done) {
      fs.remove(pathToTmp, done);
    });

    it("should take all image files from the source dir and save them at a lower resolution in the dest dir", function (done) {
      images.saveImagesForScreen(pathToAssets, pathToTmp, function (err) {
        should.not.exist(err);

        fs.readdir(pathToTmp, function (err, files) {
          should.not.exist(err);
          should.exist(files);
          files.should.be.instanceOf(Array);
          files.length.should.equal(2);
          done();
        });
      });
    });
  });
  describe("#resolveImagesInCss()", function () {
    var args;
    before(function () {
      args = {
        css: ".div1 { background-image: url(1.png); } .div2 { background-image: url(2.jpg); }",
        pathToImages: pathToAssets
      };
    });

    it("should update all image paths in the css", function (done) {
      images.resolveImagesInCss(args, function (err, resolvedCss) {
        should.not.exist(err);
        should.exist(resolvedCss);

        resolvedCss.should.contain("url(" + pathToAssets + "1.png)");
        resolvedCss.should.contain("url(" + pathToAssets + "2.jpg)");
        done();
      });
    });
  });
  describe("#resolveImagesInMarkup()", function () {
    var args;
    before(function () {
      args = {
        markup: "<img src='1.png' /><img src='1.png' /><img src='1.png' />",
        actualPathToImages: "",
        replacementPathToImages: ""
      };
    });
    after(function () {
      monkey.unpatch(images);
    });
    it("should call the resolveImageTag method for every image in the markup", function (done) {
      var count = 0;

      monkey.patch(images, {
        resolveImageTag: function (args, callback) {
          should.exist(args);
          count += 1;
          callback(null, "<img class='resolved'/>");
        }
      });

      images.resolveImagesInMarkup(args, function (err, markup) {
        should.not.exist(err);
        count.should.equal(3);
        markup.should.equal("<img class='resolved'/><img class='resolved'/><img class='resolved'/>");
        done();
      });
    });
  });
  describe("#resolveImageTag()", function () {
    var imgTag,
      args;

    before(function (done) {
      fs.mkdirp(pathToTmp, done);
    });

    after(function (done) {
      fs.remove(pathToTmp, done);
    });

    afterEach(function () {
      monkey.unpatch(fs);
    });

    beforeEach(function () {
      imgTag = "<img src=\"mallard.png\" alt=\"hello\" />";
      args = {
        imgTag: imgTag,
        actualPathToImages: pathToAssets,
        replacementPathToImages: pathToTmp
      };
    });
    it("should read the file at the correct path", function (done) {
      monkey.patch(fs, {
        readFile: function (filename) {
          filename.should.equal(pathToAssets + "mallard.png");
          done();
        }
      });

      images.resolveImageTag(args, function () {
        throw new Error("shouldn't get this far");
      });
    });
    it("should accept jpgs as well", function (done) {
      args.imgTag = "<img src=\"mallards.jpg\"/>";
      images.resolveImageTag(args, function (err, updatedMarkup) {
        should.not.exist(err);
        should.exist(updatedMarkup);

        updatedMarkup.should.contain("mallards.jpg");
        updatedMarkup.should.contain("class=\"image-mallards\"");

        done();
      });
    });
    it("should contain correct width and height of the image", function (done) {
      images.resolveImageTag(args, function (err, updatedMarkup) {
        var targetWidth, targetHeight;
        should.not.exist(err);
        should.exist(updatedMarkup);
        // size of images in test proj folder is 1280 x 800
        // the width / height should be adjusted for resolution
        targetWidth = Math.floor(1280 * 96 / 300);
        targetHeight = Math.floor(800 * 96 / 300);
        updatedMarkup.should.contain("width=\"" + targetWidth + "\"");
        updatedMarkup.should.contain("height=\"" + targetHeight + "\"");
        done();
      });
    });
    it("should add width and height even if they're already present in the tag", function (done) {
      // the most likely situation will be with width and height blank
      // as that's how namp gives 'em
      args.imgTag = "<img src=\"mallard.png\" alt=\"hello\" width=\"\" height=\"\" />";
      images.resolveImageTag(args, function (err, updatedMarkup) {
        should.not.exist(err);
        should.exist(updatedMarkup);

        updatedMarkup.should.not.contain("width=\"\"");
        updatedMarkup.should.match(/width="\d+"/);
        updatedMarkup.should.not.contain("height=\"\"");
        updatedMarkup.should.match(/height="\d+"/);
        done();
      });
    });
    it("should strip <p> tags around an image", function (done) {
      args.imgTag = "<p>" + args.imgTag + "</p>";
      images.resolveImageTag(args, function (err, updatedMarkup) {
        should.not.exist(err);
        should.exist(updatedMarkup);
        updatedMarkup.should.not.contain("<p>");
        updatedMarkup.should.not.contain("</p>");
        done();
      });
    });
    it("should give the image tag a unique class based on its name: mallard.png -> image-mallard", function (done) {
      images.resolveImageTag(args, function (err, updatedMarkup) {
        should.not.exist(err);
        should.exist(updatedMarkup);
        updatedMarkup.should.contain("class=\"image-mallard\"");
        done();
      });
    });
    it("should not overwrite the image's existing class(es)", function (done) {
      args.imgTag = "<img src=\"mallard.png\" class=\"foo bar\" alt=\"hello\" />";
      images.resolveImageTag(args, function (err, updatedMarkup) {
        should.not.exist(err);
        should.exist(updatedMarkup);
        updatedMarkup.should.contain("class=\"image-mallard foo bar\"");
        done();
      });
    });
  });
});
