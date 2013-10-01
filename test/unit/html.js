/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, before*/
"use strict";

var should = require("should"),
  html = require("../../html.js"),
  lipsum = require("lorem-ipsum"),
  dimensions;

describe("html", function () {
  describe("#paginate()", function () {
    var lipsumOptions,
      markup;
    beforeEach(function () {
      dimensions = require("../../dimensions.js");
      lipsumOptions = {
        format: "html",
        units: "paragraph"
      };
    });
    it("should output a single page if the content is small enough to fit", function (done) {
      lipsumOptions.count = 1;
      markup = lipsum(lipsumOptions);

      html.paginate({ bodyMarkup: markup }, function (err, pages) {
        should.not.exist(err);
        pages.should.have.length(1);
        done();
      });
    });
    it("should output multiple pages if the content is larger", function (done) {
      lipsumOptions.count = 10;
      markup = lipsum(lipsumOptions);

      html.paginate({ bodyMarkup: markup }, function (err, pages) {
        should.not.exist(err);
        pages.length.should.be.above(1);
        done();
      });
    });
    it("should output pages with full head and body tags", function (done) {
      lipsumOptions.count = 10;
      markup = lipsum(lipsumOptions);

      html.paginate({ bodyMarkup: markup }, function (err, pages) {
        should.not.exist(err);
        pages.forEach(function (page) {
          page.should.include("<html>");
          page.should.include("<head>");
          page.should.include("</head>");
          page.should.include("<body>");
          page.should.include("</body>");
        });
        done();
      });
    });
    it("should not leave any content overflowing from the page when images are not involved");
    it("should not split self-closing tags");
    it("should close and reopen paragraph tags if it splits a paragraph");
    it("should keep the images on the same page as the text they are around");
    it("should not leave any content overflowing from the page when images are involved");
  });
});
