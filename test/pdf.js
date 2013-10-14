/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  template = require("../template.js"),
  pdf = require("../pdf.js"),
  helper = require("./helper.js"),
  phantomWrapper = require("../phantom-wrapper.js"),
  fs = require("fs"),
  os = require("os"),
  pathToPdf,
  htmlMarkup;

describe("pdf", function () {
  before(function (done) {
    pathToPdf = os.tmpdir() + "/output.pdf";
    htmlMarkup = "<p>Hello!</p>";
    template.init("default", done);
  });
  after(function (done) {
    fs.unlink(pathToPdf, function () {
      phantomWrapper.cleanup(done);
    });
  });
  describe("#generatePdfPage()", function () {
    it("should generate a pdf from an html string", function (done) {
      pdf.generatePdfPage(htmlMarkup, pathToPdf, function (err) {
        should.not.exist(err);
        // check if file is a pdf - this has the side effect of checking if file exists, too
        helper.getFileMimeType(pathToPdf, function (err, mimetype) {
          should.not.exist(err);
          mimetype.should.include("application/pdf");
          done();
        });
      });
    });
  });
  describe("#generatePdfFromPages()", function () {
    it("should generate a pdf from an array of html strings", function (done) {
      var pages = [htmlMarkup, htmlMarkup, htmlMarkup];
      pdf.generatePdfFromPages(pages, pathToPdf, function (err, pathToPdf) {
        should.not.exist(err);
        should.exist(pathToPdf);
        pathToPdf.should.be.a("string");
        helper.getFileMimeType(pathToPdf, function (err, mimetype) {
          should.not.exist(err);
          mimetype.should.include("application/pdf");
          done();
        });
      });
    });
  });
});
