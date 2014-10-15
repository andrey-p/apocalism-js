"use strict";

var should = require("should"),
  html = require("../../lib/outputters/html"),
  htmlPage = require("../../lib/html-page"),
  helper = require("../helper"),
  fs = require("fs-extra"),
  async = require("async"),
  opts,
  input,
  css = helper.getDefaultCss();

describe("html", function () {
  before(function (done) {
    process.chdir(__dirname + "/..");

    htmlPage.init({ css: css }, done);
  });

  beforeEach(function () {
    opts = helper.getDefaultOpts();
    opts.output = "html";
    opts.css = css;
    input = [{
      content: "<p>page 1</p>",
      classes: ["body", "has-bleed", "recto", "page-1"],
      order: 1,
      pageNumber: 1
    }, {
      content: "<p>page 2</p>",
      classes: ["body", "has-bleed", "verso", "page-2"],
      order: 2,
      pageNumber: 2
    }];
  });

  afterEach(function (done) {
    fs.remove(opts.pathToOutput, done);
  });

  it("should take the pages and output them as html", function (done) {
    html(opts, input, function (err) {
      should.not.exist(err);

      fs.readFile(opts.pathToOutput + "/test.html", { encoding: "utf8" }, function (err, fileData) {
        should.not.exist(err);

        fileData.should.containEql("<p>page 1</p>");
        fileData.should.containEql("<p>page 2</p>");
        done();
      });
    });
  });
  it("should output the css in the same folder", function (done) {
    html(opts, input, function (err) {
      should.not.exist(err);

      fs.readFile(opts.pathToOutput + "/style.css", { encoding: "utf8" }, function (err, fileData) {
        should.not.exist(err);

        fileData.should.equal(css);
        done();
      });
    });
  });
  it("should output separate pages if the concat flag is set to false", function (done) {
    opts.concat = false;
    html(opts, input, function (err) {
      should.not.exist(err);

      async.map(input,
        function (page, callback) {
          fs.readFile(opts.pathToOutput + "/" + page.order + ".html", callback);
        },
        function (err, results) {
          should.not.exist(err);
          results.forEach(function (result, i) {
            result.toString().should.containEql("<p>page " + (i + 1) + "</p>");
          });

          done();
        });
    });
  });
});
