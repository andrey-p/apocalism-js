"use strict";

var should = require("should"),
  async = require("async"),
  phantomWrapper = require("../../lib/wrappers/phantom-wrapper"),
  paginate = require("../../lib/formatters/paginate"),
  htmlPage = require("../../lib/html-page"),
  helper = require("../helper"),
  lipsum = require("lorem-ipsum"),
  opts = helper.getDefaultOpts(),
  veryLongText,
  args,
  css = helper.getDefaultCss();

describe("paginate", function () {
  before(function (done) {
    async.parallel([
      async.apply(phantomWrapper.init, {}),
      async.apply(htmlPage.init, { css: css })
    ], done);
  });
  after(phantomWrapper.cleanup);

  beforeEach(function () {
    args = {
      dimensions: opts.dimensions,
      hasBleed: true,
      ignoreBlank: false
    };

    veryLongText = lipsum({
      format: "html",
      units: "paragraph",
      count: 10
    });
  });

  it("should return an array of pages with all the right properties", function (done) {
    var input = [{
      content: "<p>lorem ipsum</p>",
      classes: ["body"],
      section: "body"
    }];
    paginate(args, input, function (err, pages) {
      should.not.exist(err);
      should.exist(pages);

      pages.length.should.equal(1);
      pages[0].order.should.equal(1);
      pages[0].pageNumber.should.equal(1);
      pages[0].classes.should.containEql("body");
      pages[0].classes.should.containEql("page-1");
      pages[0].classes.should.containEql("recto");
      pages[0].content.should.equal("<p>lorem ipsum</p>");
      done();
    });
  });
  it("should return multiple pages if text is longer", function (done) {
    var input = [{
      content: veryLongText,
      classes: ["body"],
      section: "body"
    }];
    paginate(args, input, function (err, pages) {
      should.not.exist(err);
      should.exist(pages);

      pages.length.should.be.above(1);
      done();
    });
  });
  it("should preserve section order", function (done) {
    var input = [
      { content: "<p>1</p>", classes: ["front-cover"], section: "front-cover" },
      { content: "<p>2</p>", classes: ["front-matter"], section: "front-matter" },
      { content: "<p>3</p>", classes: ["body"], section: "body" },
      { content: "<p>4</p>", classes: ["body"], section: "body" },
      { content: "<p>5</p>", classes: ["back-matter"], section: "back-matter" },
      { content: "<p>6</p>", classes: ["back-matter"], section: "back-cover" }
    ];

    paginate(args, input, function (err, pages) {
      should.not.exist(err);
      should.exist(pages);

      pages.length.should.equal(6);
      pages.forEach(function (page, i) {
        page.content.should.equal("<p>" + (i + 1) + "</p>");
      });

      done();
    });
  });
  it("should preserve order across sections", function (done) {
    var input = [
      {
        content: veryLongText,
        classes: ["body"],
        section: "body"
      },
      {
        content: veryLongText,
        classes: ["back-matter"],
        section: "back-matter"
      }
    ];

    paginate(args, input, function (err, pages) {
      should.not.exist(err);
      should.exist(pages);

      pages.length.should.be.above(1);
      pages.forEach(function (page, i) {
        page.order.should.equal(i + 1);
      });
      done();
    });
  });
  it("should NOT preserve page number across sections", function (done) {
    var input = [
      {
        content: "<p>just one page</p>",
        classes: ["body"],
        section: "body"
      },
      {
        content: "<p>second page of body section</p>",
        classes: ["body"],
        section: "body"
      },
      {
        content: veryLongText,
        classes: ["back-matter"],
        section: "back-matter"
      }
    ];

    paginate(args, input, function (err, pages) {
      should.not.exist(err);
      should.exist(pages);

      pages.length.should.be.above(1);
      pages.forEach(function (page, i) {
        if (page.section === "back-matter") {
          // not "i + 1" because the one at i = 0 would've been
          // from the previous section
          page.pageNumber.should.equal(i - 1);
          page.classes.should.containEql("page-" + (i - 1));
        } else if (page.section === "body") {
          // pages from the same section should be numbered the same
          // even if they were passed as separate chunks initially
          page.pageNumber.should.equal(i + 1);
          page.classes.should.containEql("page-" + (i + 1));
        }
      });
      done();
    });
  });
  it("should return empty pages if ignoreBlank is false", function (done) {
    var input = [
      {
        content: "<p>lorem ipsum</p>",
        classes: ["body"],
        section: "body"
      },
      {
        content: "",
        classes: ["back-matter"],
        section: "back-matter"
      }
    ];

    paginate(args, input, function (err, pages) {
      should.not.exist(err);
      should.exist(pages);

      pages.length.should.equal(2);
      pages[1].content.should.equal("");

      done();
    });
  });
  it("should return no empty pages if the ignoreBlank option is true", function (done) {
    var input = [
      {
        content: "<p>lorem ipsum</p>",
        classes: ["body"],
        section: "body"
      },
      {
        content: "",
        classes: ["back-matter"],
        section: "back-matter"
      }
    ];

    args.ignoreBlank = true;

    paginate(args, input, function (err, pages) {
      should.not.exist(err);
      should.exist(pages);

      pages.length.should.equal(1);
      pages[0].content.should.equal("<p>lorem ipsum</p>");

      done();
    });
  });
});
