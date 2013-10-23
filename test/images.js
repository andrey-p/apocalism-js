/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  fs = require("fs"),
  images = require("../images.js");

describe("images", function () {
  describe("#resolveToBase64ImageData()", function () {
    var markup,
      pathToImages;

    beforeEach(function () {
      markup = "<img src=\"1.png\" alt=\"hello\" />";
      pathToImages = "test/test_project/images/";
    });
    it("should read the file at the correct path", function (done) {
      // add another file just to make sure they're parsed right
      markup += "<img src=\"2.png\" alt=\"hello\" />";
      // stub, cheekily
      var tempReadFile = fs.readFile;
      fs.readFile = function (filename, callback) {
        filename.should.equal("test/test_project/images/1.png");
        done();
        fs.readFile = tempReadFile;
      };

      images.resolveToBase64ImageData(markup, pathToImages, function () {
        throw new Error("shouldn't get this far");
      });
    });
    it("should return base64 data of the image", function (done) {
      images.resolveToBase64ImageData(markup, pathToImages, function (err, updatedMarkup) {
        should.not.exist(err);
        should.exist(updatedMarkup);
        // verifying the actual base64 data will probably be a mistake
        updatedMarkup.should.contain("<img src=\"data:image/png;base64,");
        done();
      });
    });
  });
});
