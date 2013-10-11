/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  pdf = require("../../pdf.js"),
  helper = require("../helper.js"),
  phantomWrapper = require("../../phantom-wrapper.js"),
  fs = require("fs"),
  os = require("os");

describe("pdf", function () {
  describe("#generateFromHtml", function () {
    var pathToPdf,
      htmlMarkup;
    before(function () {
      pathToPdf = os.tmpdir() + "/output.pdf";
      htmlMarkup = "<p>Hello!</p>";
    });
    after(function (done) {
      fs.unlink(pathToPdf, function () {
        phantomWrapper.cleanup(done);
      });
    });
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
});
