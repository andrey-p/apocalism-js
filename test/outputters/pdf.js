"use strict";

var should = require("should"),
  pdf = require("../../lib/outputters/pdf"),
  phantomWrapper = require("../../lib/wrappers/phantom-wrapper"),
  htmlPage = require("../../lib/html-page"),
  fs = require("fs-extra"),
  async = require("async"),
  helper = require("../helper"),
  opts,
  input,
  css = helper.getDefaultCss();

describe("pdf", function () {
  before(function (done) {
    process.chdir(__dirname + "/..");

    async.series([
      async.apply(phantomWrapper.init, {}),
      async.apply(htmlPage.init, { css: css })
    ], done);
  });
  after(phantomWrapper.cleanup);
  beforeEach(function () {
    opts = helper.getDefaultOpts();
    input = [{
      content: "page one",
      classes: ["body", "has-bleed", "recto", "page-1"],
      order: 1,
      pageNumber: 1
    }, {
      content: "page two",
      classes: ["body", "has-bleed", "verso", "page-2"],
      order: 2,
      pageNumber: 2
    }];
  });
  afterEach(function (done) {
    fs.remove(opts.pathToOutput, done);
  });
  it("should take the pages and output a single pdf", function (done) {
    pdf(opts, input, function (err) {
      should.not.exist(err);

      helper.getFileMimeType(opts.pathToOutput + "/test.pdf", function (err, mimetype) {
        should.not.exist(err);
        mimetype.should.containEql("application/pdf");
        done();
      });
    });
  });
  it("should output a pdf with the right number of pages", function (done) {
    pdf(opts, input, function (err) {
      should.not.exist(err);

      helper.getPdfPageCount(opts.pathToOutput + "/test.pdf", function (err, pageCount) {
        should.not.exist(err);
        pageCount.should.equal(2);

        done();
      });
    });
  });
  it("should output separate pages if the concat flag is set to false", function (done) {
    opts.concat = false;
    pdf(opts, input, function (err) {
      should.not.exist(err);

      async.map(input,
        function (page, callback) {
          helper.getFileMimeType(opts.pathToOutput + "/" + page.order + ".pdf", callback);
        },
        function (err, mimetypes) {
          should.not.exist(err);

          mimetypes.forEach(function (mimetype) {
            mimetype.should.containEql("application/pdf");
          });

          done();
        });
    });
  });
  it("should NOT leave all the page pdf files if concat is true", function (done) {
    pdf(opts, input, function (err) {
      should.not.exist(err);

      var files = input.map(function (page) {
        return opts.pathToOutput + "/" + page.order + ".pdf";
      });

      async.some(files, fs.exists, function (result) {
        result.should.equal(false);
        done();
      });
    });
  });
  it("should NOT leave image files in the output folder", function (done) {
    pdf(opts, input, function (err) {
      should.not.exist(err);

      fs.readdir(opts.pathToOutput + "/" + opts.pathToImages, function (err) {
        should.exist(err);
        err.code.should.equal("ENOENT");
        done();
      });
    });
  });
});
