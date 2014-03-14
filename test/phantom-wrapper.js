"use strict";

var should = require("should"),
  phantomWrapper = require("../lib/phantom-wrapper.js"),
  template = require("../lib/template.js"),
  helper = require("./helper.js"),
  fs = require("fs-extra"),
  os = require("os"),
  lipsum = require("lorem-ipsum"),
  opts = helper.getDefaultOpts(),
  htmlMarkup;

describe("phantom-wrapper", function () {
  describe("#createPage()", function () {
    var lipsumOptions,
      args;

    before(function (done) {
      args = {
        dimensions: {
          width: (opts.stock.width - opts.margin.outer * 2) * 300 / 25.4,
          height: (opts.stock.height - opts.margin.outer * 2) * 300 / 25.4
        }
      };
      template.init(opts, function () {
        args.blankPage = template.getBlankPage("page");
        phantomWrapper.initCreatePage(done);
      });
    });

    beforeEach(function () {
      lipsumOptions = {
        format: "html",
        units: "paragraph"
      };
    });

    after(function () {
      phantomWrapper.cleanup();
    });

    it("should output a filled out page", function (done) {
      lipsumOptions.count = 1;
      args.markup = lipsum(lipsumOptions);
      phantomWrapper.createPage(args, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);
        page.should.not.equal(args.emptyPageMarkup);
        leftoverMarkup.length.should.equal(0);
        done();
      });
    });
    it("should output a page and leftovers if passed a long text", function (done) {
      lipsumOptions.count = 100;
      args.markup = lipsum(lipsumOptions);
      phantomWrapper.createPage(args, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);
        leftoverMarkup.length.should.be.above(0);
        done();
      });
    });
    it("should be able to split paragraphs at page break", function (done) {
      var i, wordsInPage, wordsInLeftover, numberWords = 500, endFirstTagIndex;
      args.markup = "<p>start ";
      for (i = 0; i < numberWords; i += 1) {
        args.markup += "word ";
      }
      args.markup += "end</p>";
      phantomWrapper.createPage(args, function (err, page, leftoverMarkup) {
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
      args.markup = "<p>start</p>";
      for (i = 0; i < numberParas; i += 1) {
        args.markup += "<p>para</p>";
      }
      args.markup += "<p>end</p>";

      phantomWrapper.createPage(args, function (err, page, leftoverMarkup) {
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
      args.markup = "<p>start</p>";
      for (i = 0; i < numberParas; i += 1) {
        args.markup += "<p>para" + i + "</p>";
      }
      args.markup += "<p>end</p>";

      phantomWrapper.createPage(args, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);

        leftoverMarkup.indexOf("para450").should.not.be.above(leftoverMarkup.indexOf("para451"));
        done();
      });
    });
    it("should interpret a paragraph containing 3 or more eq signs and nothing else as a page break", function (done) {
      args.markup = "<p>on page 1</p><p>==</p><p>on page 1</p><p>===</p><p>in leftover</p>";

      phantomWrapper.createPage(args, function (err, page, leftoverMarkup) {
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
    it("should not continue adding stuff after an image and a page break followed by text", function (done) {
      args.markup = "<img width=\"100\" height=\"100\" src=\"foo.png\" /><p>===</p><p>should be leftover</p>";

      phantomWrapper.createPage(args, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);

        page.should.contain("<img width=\"100\" height=\"100\" src=\"foo.png\">");
        page.should.not.contain("<p>should be leftover</p>");
        leftoverMarkup.should.contain("<p>should be leftover</p>");

        done();
      });
    });
    it("should not return comments in leftover", function (done) {
      args.markup = "<p>foo</p><!-- bar --><p>baz</p><!-- bla -->";

      phantomWrapper.createPage(args, function (err, page, leftoverMarkup) {
        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);

        page.should.contain("<p>foo</p>");
        page.should.contain("<p>baz</p>");

        leftoverMarkup.should.not.contain("bar");
        leftoverMarkup.should.not.contain("bla");

        done();
      });
    });
    it("should not miss out dots after an em tag when a paragraph has been split (issue #19)", function (done) {
      var i, numberParas = 10;
      for (i = 0; i < numberParas; i += 1) {
        // adding manually because lipsum outputs a different paragraph each time
        // and we want sameness
        args.markup += "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
        args.markup += "Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. ";
        args.markup += "Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. ";
        args.markup += "Donec <em>et mollis dolor</em>.</p>";
      }

      phantomWrapper.createPage(args, function (err, page, leftoverMarkup) {
        var emTagsInPage,
          emTagsInLeftover,
          emTagRegexp = /dolor<\/em>\.<\/p>/g;

        should.not.exist(err);
        should.exist(page);
        should.exist(leftoverMarkup);

        emTagsInPage = page.match(emTagRegexp);
        emTagsInLeftover = leftoverMarkup.match(emTagRegexp);

        (emTagsInPage.length + emTagsInLeftover.length).should.equal(10);
        done();
      });
    });
  });
  describe("#generatePdfPage()", function () {
    var args;

    before(function (done) {
      // need this because the phantom script creates its own dir
      opts.pathToOutput = os.tmpdir() + "/apoc_out/";

      args = {
        pathToPdf: opts.pathToOutput + "output.pdf",
        markup: "<p>Hello!</p>",
        dimensions: {
          width: opts.stock.width + opts.bleed * 2,
          height: opts.stock.height + opts.bleed * 2
        }
      };
      phantomWrapper.initCreatePdfPage(done);
    });
    after(function (done) {
      fs.remove(opts.pathToOutput, done);
      phantomWrapper.cleanup();
    });
    it("should generate a pdf from an html string", function (done) {
      phantomWrapper.generatePdfPage(args, function (err) {
        should.not.exist(err);
        // check if file is a pdf - this has the side effect of checking if file exists, too
        helper.getFileMimeType(opts.pathToOutput + "output.pdf", function (err, mimetype) {
          should.not.exist(err);
          mimetype.should.include("application/pdf");
          done();
        });
      });
    });
    it("should output pages in A5 format + bleed if the default template is being used", function (done) {
      phantomWrapper.generatePdfPage(args, function (err) {
        should.not.exist(err);
        helper.getPdfPaperSize(args.pathToPdf, function (err, paperSize) {
          should.not.exist(err);
          // 431 x 607 pts is 152 x 214.1mm, which is more or less A5 with 2mm bleed
          paperSize.should.include("431 x 607");
          done();
        });
      });
    });
  });
});
