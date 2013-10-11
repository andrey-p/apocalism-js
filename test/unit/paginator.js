/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, before*/
"use strict";

var should = require("should"),
  paginator = require("../../paginator.js"),
  template = require("../../template.js"),
  phantomWrapper = require("../../phantom-wrapper.js"),
  lipsum = require("lorem-ipsum"),
  helper = require("../helper.js"),
  dimensions;

describe("paginator", function () {
  after(function (done) {
    phantomWrapper.cleanup(function () {
      helper.killProcess("phantomjs", done)
    });
  });
  describe("#createPage()", function () {
    var lipsumOptions,
      markup,
      emptyPageMarkup;

    beforeEach(function () {
      dimensions = require("../../dimensions.js");
      lipsumOptions = {
        format: "html",
        units: "paragraph"
      };
      emptyPageMarkup = template.getNewEmptyPageMarkup();
    });

    it("should output a filled out page", function (done) {
      lipsumOptions.count = 1;
      markup = lipsum(lipsumOptions);
      paginator.createPage(emptyPageMarkup, markup, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);
        page.should.not.equal(emptyPageMarkup);
        leftoverMarkup.should.be.empty;
        done();
      });
    });
    it("should output a page and leftovers if passed a long text", function (done) {
      lipsumOptions.count = 100;
      markup = lipsum(lipsumOptions);
      paginator.createPage(emptyPageMarkup, markup, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(leftoverMarkup);
        leftoverMarkup.should.not.be.empty;
        done();
      });
    });
    it("should be able to split paragraphs at page break", function (done) {
      var i, wordsInPage, wordsInLeftover, numberWords = 500;
      markup = "<p>start ";
      for (i = 0; i < numberWords; i += 1) {
        markup += "word ";
      }
      markup += "end</p>";
      paginator.createPage(emptyPageMarkup, markup, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);
        // "word" should be the first word in leftover
        leftoverMarkup.indexOf("word").should.equal(0);

        // check no words have been left out
        wordsInPage = (page.match(/word/g) || []).length;
        wordsInLeftover = (leftoverMarkup.match(/word/g) || []).length;
        (wordsInPage + wordsInLeftover).should.equal(numberWords);
        done();
      });
    });
  });
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
      lipsumOptions.units = "sentence";
      markup = lipsum(lipsumOptions);

      paginator.paginate({ bodyMarkup: markup }, function (err, pages) {
        should.not.exist(err);
        pages.should.have.length(1);
        done();
      });
    });
    it("should output multiple pages if the content is larger", function (done) {
      lipsumOptions.count = 10;
      markup = lipsum(lipsumOptions);

      paginator.paginate({ bodyMarkup: markup }, function (err, pages) {
        should.not.exist(err);
        pages.length.should.be.above(1);
        done();
      });
    });
    it("should output pages with full head and body tags", function (done) {
      lipsumOptions.count = 10;
      markup = lipsum(lipsumOptions);

      paginator.paginate({ bodyMarkup: markup }, function (err, pages) {
        should.not.exist(err);
        pages.forEach(function (page) {
          page.should.include("<html>");
          page.should.include("<head>");
          page.should.include("</head>");
          page.should.include("<body");
          page.should.include("</body>");
        });
        done();
      });
    });
  });
});
