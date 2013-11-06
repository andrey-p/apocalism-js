/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  options = require("../lib/options.js"),
  pdf = require("../lib/pdf.js"),
  helper = require("./helper.js"),
  fs = require("fs"),
  os = require("os"),
  pathToPdf,
  htmlMarkup;

describe("pdf", function () {
  before(function (done) {
    pathToPdf = os.tmpdir() + "/output.pdf";
    htmlMarkup = "<p>Hello!</p>";
    options.set({
      title: "test",
      author: "test",
      quiet: true
    }, done);
  });
  after(function (done) {
    fs.unlink(pathToPdf, done);
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
    it("should output pages in A5 format + bleed if the default template is being used", function (done) {
      pdf.generatePdfPage(htmlMarkup, pathToPdf, function (err) {
        should.not.exist(err);
        helper.getPdfPaperSize(pathToPdf, function (err, paperSize) {
          should.not.exist(err);
          // 431 x 607 pts is 152 x 214.1mm, which is more or less A5 with 2mm bleed
          paperSize.should.include("431 x 607");
          done();
        });
      });
    });
  });
  describe("#generatePdfFromPages()", function () {
    it("should generate a pdf from an array of html strings", function (done) {
      var pages = [
        { htmlContent: htmlMarkup, order: 1 },
        { htmlContent: htmlMarkup, order: 2 },
        { htmlContent: htmlMarkup, order: 3 }
      ];
      pdf.generatePdfFromPages(pages, pathToPdf, function (err, pathToPdf) {
        should.not.exist(err);
        should.exist(pathToPdf);
        pathToPdf.should.have.type("string");
        helper.getFileMimeType(pathToPdf, function (err, mimetype) {
          should.not.exist(err);
          mimetype.should.include("application/pdf");
          done();
        });
      });
    });
  });
});
