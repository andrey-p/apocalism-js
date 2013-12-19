/*jslint indent: 2, node: true*/
/*globals it, describe, after, beforeEach, before*/
"use strict";

var should = require("should"),
  options = require("../lib/options.js"),
  template = require("../lib/template.js"),
  paginator = require("../lib/paginator.js"),
  progress = require("../lib/progress.js"),
  lipsum = require("lorem-ipsum"),
  helper = require("./helper.js"),
  opts = helper.getDefaultOpts(),
  emptyPageMarkup;

describe("paginator", function () {
  before(function (done) {
    progress.init(opts, function () {
      template.init(opts, function () {
        paginator.init(opts, function () {
          emptyPageMarkup = template.getBlankPage("page");
          done();
        });
      });
    });
  });
  describe("#paginate()", function () {
    var lipsumOptions,
      markup,
      args;

    beforeEach(function () {
      lipsumOptions = {
        format: "html",
        units: "paragraph"
      };
      args = {};
    });
    it("should output a single page if the content is small enough to fit", function (done) {
      lipsumOptions.count = 1;
      lipsumOptions.units = "sentence";
      markup = "<p>" + lipsum(lipsumOptions) + "<p>";
      args = { templateName: "pdf", sectionName: "body", content: markup };

      paginator.paginate(args, function (err, pages) {
        should.not.exist(err);
        pages.should.have.length(1);
        done();
      });
    });
    it("should output multiple pages if the content is larger", function (done) {
      lipsumOptions.count = 10;
      markup = lipsum(lipsumOptions);
      args = { templateName: "pdf", sectionName: "body", content: markup };

      paginator.paginate(args, function (err, pages) {
        should.not.exist(err);
        pages.length.should.be.above(1);
        done();
      });
    });
    it("should output pages with full head and body tags", function (done) {
      lipsumOptions.count = 10;
      markup = lipsum(lipsumOptions);
      args = { templateName: "pdf", sectionName: "body", content: markup };

      paginator.paginate(args, function (err, pages) {
        should.not.exist(err);
        pages.forEach(function (page) {
          page.should.include("<html>");
          page.should.include("<head>");
          page.should.include("</head>");
          page.should.include("<body");
          page.should.include("</body>");
        });
        done();
      });
    });
  });
});
