/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before, afterEach*/
"use strict";

var should = require("should"),
  helper = require("./helper.js"),
  book = require("../lib/book.js"),
  fs = require("fs"),
  pdf = require("../lib/pdf.js"),
  template = require("../lib/template.js"),
  images = require("../lib/images.js"),
  monkey = require("monkey-patch"),
  opts = helper.getDefaultOpts();

describe("book", function () {
  describe("#compilePages()", function () {
    it("should resolve the images in all the sections");
    it("should save the images for screen if loRes is true");
    it("should paginate all content sections");
    it("should create standalone pages for all single page sections");
  });
  describe("#compilePdf()", function () {
    beforeEach(function (done) {
      book.init(opts, done);
    });
    afterEach(function () {
      monkey.unpatch(pdf);
    });
    it("should call the pdf.generatePdfFromPages method with all the pages", function (done) {
      var pagesToGenerateFrom = helper.getSamplePages();
      monkey.patch(pdf, {
        generatePdfFromPages: function (pages, filename) {
          pages.should.be.instanceOf(Array);
          pages.should.equal(pagesToGenerateFrom);

          filename.should.equal(opts.pathToOutput + opts.filename + ".pdf");

          done();
        }
      });

      book.compilePdf(pagesToGenerateFrom, function () {
        throw new Error("should not get here");
      });
    });
  });
  describe("#compileWebpage()", function () {
    afterEach(function () {
      monkey.unpatch(template);
      monkey.unpatch(fs);
    });
    it("should request a filled out html_layout page", function (done) {
      var pagesToGenerateFrom = helper.getSamplePages();
      monkey.patch(template, {
        getTemplatePage: function (templateName, templateArgs) {
          templateName.should.equal("html_layout");
          templateArgs.pagesMarkup.should.equal("<p>foo</p><p>bar</p>");

          return "there's your markup";
        }
      });

      monkey.patch(fs, {
        writeFile: function (filename, contents) {
          filename.should.equal(opts.pathToOutput + opts.filename + ".html");
          contents.should.equal("there's your markup");

          done();
        }
      });

      book.compileWebpage(pagesToGenerateFrom, function () {
        throw new Error("should not get here");
      });
    });
    it("should save the style assets to the output dir", function (done) {
      var pagesToGenerateFrom = helper.getSamplePages();

      monkey.patch(template, {
        getTemplatePage: function () {
          return "";
        },
        saveStyleAssetsToDir: function (path) {
          path.should.equal(opts.pathToOutput);

          done();
        }
      });

      monkey.patch(fs, {
        writeFile: function (filename, contents, callback) {
          should.exist(filename);
          should.exist(contents);

          callback();
        }
      });

      book.compileWebpage(pagesToGenerateFrom, function () {
        throw new Error("should not get here");
      });
    });
  });
});
