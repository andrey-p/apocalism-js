/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  helper = require("./helper.js"),
  pdf = require("../lib/pdf.js"),
  fs = require("fs"),
  phantomWrapper = require("../lib/phantom-wrapper.js"),
  pdftkWrapper = require("../lib/pdftk-wrapper.js"),
  monkey = require("monkey-patch"),
  arg = require("arg-err"),
  progress = require("../lib/progress.js"),
  opts = helper.getDefaultOpts();

describe("pdf", function () {
  var pages,
    pathToPdf;

  before(function (done) {
    pages = [
      {
        htmlContent: "<p>hello!</p>",
        order: 1
      },
      {
        htmlContent: "<p>goodbye!</p>",
        order: 2
      }
    ];

    pathToPdf = opts.pathToOutput + "output.pdf";

    pdf.init(opts, function () {
      progress.init(opts, done);
    });
  });
  describe("#generatePdfFromPages()", function () {
    beforeEach(function () {
      monkey.patch(fs, {
        readdir: function (dir, callback) {
          callback(null, ["file1.pdf", "file2.pdf", "file3.pdf"]);
        }
      });

      monkey.patch(phantomWrapper, {
        generatePdfPage: function (args, callback) {
          callback(null, args.pathToPdf);
        }
      });

      monkey.patch(pdftkWrapper, {
        concatenatePages: function (pathsToPdfs, pathToPdf, callback) {
          callback(null, pathToPdf);
        }
      });
    });

    afterEach(function () {
      monkey.unpatch(fs);
      monkey.unpatch(phantomWrapper);
      monkey.unpatch(pdftkWrapper);
    });

    it("should call phantomWrapper#generatePdfPage() method once for each page passed", function (done) {
      var called = 0;
      phantomWrapper.generatePdfPage = function (args, callback) {

        // check args are right
        should(arg.err(args, {
          pathToPdf: "string",
          dimensions: { width: "number", height: "number" },
          markup: "string"
        })).not.ok;

        called += 1;

        callback(null, args.pathToPdf);
      };

      pdf.generatePdfFromPages(pages, pathToPdf, function (err, pathToPdf) {
        called.should.equal(2);
        should.not.exist(err);
        done();
      });
    });
    it("should read all files in the tmp folder", function (done) {
      fs.readdir = function (dir, callback) {
        should.exist(dir);
        dir.should.equal(opts.pathToTmp);
        callback(null, ["file1.pdf", "file2.pdf", "file3.pdf"]);
      };
      pdf.generatePdfFromPages(pages, pathToPdf, function (err, pathToPdf) {
        should.not.exist(err);
        done();
      });
    });
    it("should call pdftkWrapper#concatenatePages() with all pdfs in the correct order", function (done) {
      fs.readdir = function (dir, callback) {
        callback(null, ["1.pdf", "11.pdf", "2.pdf"]);
      };
      pdftkWrapper.concatenatePages = function (paths, pathToPdf, callback) {
        paths.should.be.an.Array;
        paths.length.should.equal(3);
        paths[0].should.equal(opts.pathToTmp + "1.pdf");
        paths[1].should.equal(opts.pathToTmp + "2.pdf");
        paths[2].should.equal(opts.pathToTmp + "11.pdf");

        callback(null, pathToPdf);
      };
      pdf.generatePdfFromPages(pages, pathToPdf, function (err, pathToPdf) {
        should.not.exist(err);
        done();
      });
    });
  });
});
