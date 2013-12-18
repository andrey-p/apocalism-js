/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  phantomWrapper = require("../lib/phantom-wrapper.js"),
  helper = require("./helper.js"),
  fs = require("fs-extra"),
  os = require("os"),
  opts = helper.getDefaultOpts(),
  htmlMarkup;

describe("phantom-wrapper", function () {
  var args;

  before(function () {
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
  });
  after(function (done) {
    fs.remove(opts.pathToOutput, done);
  });
  describe("#generatePdfPage()", function () {
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
