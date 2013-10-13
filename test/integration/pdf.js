/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  template = require("../../template.js"),
  pdf = require("../../pdf.js"),
  helper = require("../helper.js"),
  phantomWrapper = require("../../phantom-wrapper.js"),
  fs = require("fs"),
  os = require("os");

describe("pdf", function () {
  var pathToPdf,
    htmlMarkup;
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
  describe("#generateFromHtml()", function () {
    it("should generate a pdf from an html string", function (done) {
      pdf.generateFromHtml(htmlMarkup, pathToPdf, function (err) {
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
  describe("#generatePagesFromHtml()", function () {
    it("should generate a series of pdfs from an array of html strings", function (done) {
      var pages = [htmlMarkup, htmlMarkup, htmlMarkup];
      pdf.generatePagesFromHtml(pages, function (err, pathsToPdfs) {
        should.not.exist(err);
        should.exist(pathsToPdfs);
        pathsToPdfs.should.be.an.instanceOf(Array);
        pathsToPdfs.length.should.equal(3);
        done();
      });
    });
  });
});
