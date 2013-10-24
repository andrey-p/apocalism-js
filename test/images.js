/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  fs = require("fs"),
  images = require("../images.js");

describe("images", function () {
  describe("#resolveImageTag()", function () {
    var markup,
      pathToImages;

    beforeEach(function () {
      markup = "<img src=\"1.png\" alt=\"hello\" />";
      pathToImages = "test/test_project/images/";
    });
    it("should read the file at the correct path", function (done) {
      // stub, cheekily
      var tempReadFile = fs.readFile;
      fs.readFile = function (filename, callback) {
        filename.should.equal("test/test_project/images/1.png");
        done();
        fs.readFile = tempReadFile;
      };

      images.resolveImageTag(markup, pathToImages, function () {
        throw new Error("shouldn't get this far");
      });
    });
    it("should return base64 data of the image", function (done) {
      images.resolveImageTag(markup, pathToImages, function (err, updatedMarkup) {
        should.not.exist(err);
        should.exist(updatedMarkup);
        // verifying the actual base64 data will probably be a mistake
        updatedMarkup.should.contain("<img src=\"data:image/png;base64,");
        done();
      });
    });
    it("should contain correct width and height of the image", function (done) {
      images.resolveImageTag(markup, pathToImages, function (err, updatedMarkup) {
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
      markup = "<img src=\"1.png\" alt=\"hello\" width=\"\" height=\"\" />";
      images.resolveImageTag(markup, pathToImages, function (err, updatedMarkup) {
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
      markup = "<p>" + markup + "</p>";
      images.resolveImageTag(markup, pathToImages, function (err, updatedMarkup) {
        should.not.exist(err);
        should.exist(updatedMarkup);
        updatedMarkup.should.not.contain("<p>");
        updatedMarkup.should.not.contain("</p>");
        done();
      });
    });
  });
});
