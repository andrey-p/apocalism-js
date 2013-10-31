/*jslint indent: 2, node: true*/
/*globals it, describe, after, beforeEach, before*/
"use strict";

var should = require("should"),
  options = require("../options.js"),
  template = require("../template.js"),
  paginator = require("../paginator.js"),
  lipsum = require("lorem-ipsum"),
  helper = require("./helper.js"),
  emptyPageMarkup;

describe("paginator", function () {
  before(function (done) {
    options.set({
      title: "test",
      author: "test",
      quiet: true
    }, function (err) {
      should.not.exist(err);
      emptyPageMarkup = template.getBlankPage();
      done();
    });
  });
  describe("#createPage()", function () {
    var lipsumOptions,
      markup;

    beforeEach(function () {
      lipsumOptions = {
        format: "html",
        units: "paragraph"
      };
    });

    it("should output a filled out page", function (done) {
      lipsumOptions.count = 1;
      markup = lipsum(lipsumOptions);
      paginator.createPage(emptyPageMarkup, markup, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);
        page.should.not.equal(emptyPageMarkup);
        leftoverMarkup.length.should.equal(0);
        done();
      });
    });
    it("should output a page and leftovers if passed a long text", function (done) {
      lipsumOptions.count = 100;
      markup = lipsum(lipsumOptions);
      paginator.createPage(emptyPageMarkup, markup, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(leftoverMarkup);
        leftoverMarkup.length.should.be.above(0);
        done();
      });
    });
    it("should be able to split paragraphs at page break", function (done) {
      var i, wordsInPage, wordsInLeftover, numberWords = 500, endFirstTagIndex;
      markup = "<p>start ";
      for (i = 0; i < numberWords; i += 1) {
        markup += "word ";
      }
      markup += "end</p>";
      paginator.createPage(emptyPageMarkup, markup, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);

        // first para should be given a class of contd
        leftoverMarkup.should.startWith("<p class='contd");

        // "word" should be the first word in leftover after the opening tag
        endFirstTagIndex = leftoverMarkup.indexOf(">");
        leftoverMarkup.indexOf("word").should.equal(endFirstTagIndex + 1);

        // check no words have been left out
        wordsInPage = (page.match(/word/g) || []).length;
        wordsInLeftover = (leftoverMarkup.match(/word/g) || []).length;
        (wordsInPage + wordsInLeftover).should.equal(numberWords);
        done();
      });
    });
    it("shouldn't give paragraphs a contd class if they haven't been split", function (done) {
      var i, numberParas = 50;
      markup = "<p>start</p>";
      for (i = 0; i < numberParas; i += 1) {
        markup += "<p>para</p>";
      }
      markup += "<p>end</p>";

      paginator.createPage(emptyPageMarkup, markup, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);

        leftoverMarkup.should.startWith("<p>para</p>");
        done();
      });
    });
    it("should output paragraphs in leftover in the correct order", function (done) {
      // this is an issue that only seems to crop up in later paragraphs
      var i, numberParas = 500;
      markup = "<p>start</p>";
      for (i = 0; i < numberParas; i += 1) {
        markup += "<p>para" + i + "</p>";
      }
      markup += "<p>end</p>";

      paginator.createPage(emptyPageMarkup, markup, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);

        leftoverMarkup.indexOf("para450").should.not.be.above(leftoverMarkup.indexOf("para451"));
        done();
      });
    });
    it("should interpret a paragraph containing 3 or more eq signs and nothing else as a page break", function (done) {
      markup = "<p>on page 1</p><p>==</p><p>on page 1</p><p>===</p><p>in leftover</p>";

      paginator.createPage(emptyPageMarkup, markup, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);

        page.should.contain("<p>on page 1</p>");
        page.should.contain("<p>==</p>");
        page.should.not.contain("<p>===</p>");

        leftoverMarkup.should.contain("<p>in leftover</p>");
        leftoverMarkup.should.not.contain("<p>on page 1</p>");
        leftoverMarkup.should.not.contain("<p>===</p>");

        done();
      });
    });
  });
  describe("#paginate()", function () {
    var lipsumOptions,
      markup;
    beforeEach(function () {
      lipsumOptions = {
        format: "html",
        units: "paragraph"
      };
    });
    it("should output a single page if the content is small enough to fit", function (done) {
      lipsumOptions.count = 1;
      lipsumOptions.units = "sentence";
      markup = "<p>" + lipsum(lipsumOptions) + "<p>";

      paginator.paginate(markup, function (err, pages) {
        should.not.exist(err);
        pages.should.have.length(1);
        done();
      });
    });
    it("should output multiple pages if the content is larger", function (done) {
      lipsumOptions.count = 10;
      markup = lipsum(lipsumOptions);

      paginator.paginate(markup, function (err, pages) {
        should.not.exist(err);
        pages.length.should.be.above(1);
        done();
      });
    });
    it("should output pages with full head and body tags", function (done) {
      lipsumOptions.count = 10;
      markup = lipsum(lipsumOptions);

      paginator.paginate(markup, function (err, pages) {
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
