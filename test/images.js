/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  fs = require("fs"),
  monkey = require("monkey-patch"),
  images = require("../lib/images.js");

describe("images", function () {
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
      actualPathToImages,
      replacementPathToImages,
      args;

    beforeEach(function () {
      imgTag = "<img src=\"1.png\" alt=\"hello\" />";
      actualPathToImages = "test/test_project/images/";
      replacementPathToImages = "test/test_project/images/";
      args = {
        imgTag: imgTag,
        actualPathToImages: actualPathToImages,
        replacementPathToImages: replacementPathToImages
      };
    });
    it("should read the file at the correct path", function (done) {
      // stub, cheekily
      var tempReadFile = fs.readFile;
      fs.readFile = function (filename) {
        filename.should.equal("test/test_project/images/1.png");
        done();
        fs.readFile = tempReadFile;
      };

      images.resolveImageTag(args, function () {
        throw new Error("shouldn't get this far");
      });
    });
    it("should contain correct width and height of the image", function (done) {
      images.resolveImageTag(args, function (err, updatedMarkup) {
        var targetWidth, targetHeight;
        should.not.exist(err);
        should.exist(updatedMarkup);
        // size of images in test proj folder is 1299 x 901
        // the width / height should be adjusted for resolution
        targetWidth = Math.floor(1299 * 96 / 300);
        targetHeight = Math.floor(901 * 96 / 300);
        updatedMarkup.should.contain("width=\"" + targetWidth + "\"");
        updatedMarkup.should.contain("height=\"" + targetHeight + "\"");
        done();
      });
    });
    it("should add width and height even if they're already present in the tag", function (done) {
      // the most likely situation will be with width and height blank
      // as that's how namp gives 'em
      args.imgTag = "<img src=\"1.png\" alt=\"hello\" width=\"\" height=\"\" />";
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
    it("should give the image tag a unique class based on its name: 1.png -> image-1", function (done) {
      images.resolveImageTag(args, function (err, updatedMarkup) {
        should.not.exist(err);
        should.exist(updatedMarkup);
        updatedMarkup.should.contain("class=\"image-1\"");
        done();
      });
    });
    it("should not overwrite the image's existing class(es)", function (done) {
      args.imgTag = "<img src=\"1.png\" class=\"foo bar\" alt=\"hello\" />";
      images.resolveImageTag(args, function (err, updatedMarkup) {
        should.not.exist(err);
        should.exist(updatedMarkup);
        updatedMarkup.should.contain("class=\"image-1 foo bar\"");
        done();
      });
    });
  });
});
