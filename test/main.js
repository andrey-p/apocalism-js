"use strict";

var should = require("should"),
  helper = require("./helper.js"),
  defaultOpts = helper.getDefaultOpts(),
  main = require("../lib/main.js"),
  fs = require("fs-extra"),
  async = require("async"),
  monkey = require("monkey-patch"),
  options = require("../lib/options.js"),
  reader = require("../lib/reader.js"),
  book = require("../lib/book.js");

describe("main", function () {
  beforeEach(function () {
    // this is always called so patch it
    monkey.patch(fs, {
      mkdirp: function (path, callback) {
        should.exist(path);
        callback();
      }
    });
  });
  afterEach(function () {
    monkey.unpatch(fs);
  });
  describe("common", function () {
    var commonMethodsToTest;
    before(function () {
      commonMethodsToTest = [
        "compilePdf",
        "compileWebpage"
      ];
    });
    afterEach(function () {
      monkey.unpatch(options);
      monkey.unpatch(reader);
      monkey.unpatch(book);
    });
    it("should hit all the required methods on options, reader and book", function (done) {
      var setCalled, readCalled, compilePagesCalled, compileFormatCalled;

      monkey.patch(options, {
        set: function (opts, callback) {
          should.exist(opts);
          setCalled = true;
          callback(null, defaultOpts);
        }
      });

      monkey.patch(reader, {
        read: function (callback) {
          readCalled = true;
          callback(null, { sectionName: "sectionContent" });
        }
      });

      monkey.patch(book, {
        compilePages: function (sections, callback) {
          sections.should.eql({ sectionName: "sectionContent" });
          compilePagesCalled = true;
          callback(null, ["page 1", "page 2"]);
        },
        compileWebpage: function (pages, callback) {
          pages.should.eql(["page 1", "page 2"]);
          compileFormatCalled = true;
          callback(null, "path");
        },
        compilePdf: function (pages, callback) {
          pages.should.eql(["page 1", "page 2"]);
          compileFormatCalled = true;
          callback(null, "path");
        }
      });

      async.each(commonMethodsToTest,
        function (method, callback) {
          setCalled = false;
          readCalled = false;
          compilePagesCalled = false;
          compileFormatCalled = false;

          main[method]("filename", {}, function () {
            setCalled.should.equal(true);
            readCalled.should.equal(true);
            compilePagesCalled.should.equal(true);
            compileFormatCalled.should.equal(true);

            callback();
          });
        }, done);
    });
    it("should add the progress to the opts if quiet is false", function (done) {
      var hasProgress;
      monkey.patch(options, {
        set: function (opts, callback) {
          should.exist(opts);
          hasProgress = true;
          opts.progress.should.have.property("update");
          opts.progress.should.have.property("start");
          opts.progress.should.have.property("end");
          callback(null, defaultOpts);
        }
      });

      monkey.patch(reader, {
        read: function (callback) {
          callback(null, { sectionName: "sectionContent" });
        }
      });

      monkey.patch(book, {
        compilePages: function (sections, callback) {
          should.exist(sections);
          callback(null, ["page 1", "page 2"]);
        },
        compileWebpage: function (pages, callback) {
          should.exist(pages);
          callback(null, "path");
        },
        compilePdf: function (pages, callback) {
          should.exist(pages);
          callback(null, "path");
        }
      });

      async.each(commonMethodsToTest,
        function (method, callback) {
          hasProgress = false;
          main[method]("filename", { quiet: false }, function () {
            hasProgress.should.equal(true);
            callback();
          });
        }, done);
    });
  });
  describe("#compilePdf()", function () {
    afterEach(function () {
      monkey.unpatch(options);
      monkey.unpatch(reader);
      monkey.unpatch(book);
    });
  });
  describe("#compileWebpage()", function () {
    afterEach(function () {
      monkey.unpatch(options);
      monkey.unpatch(reader);
      monkey.unpatch(book);
    });
    it("should asume all the webpage-related options", function (done) {
      monkey.patch(options, {
        set: function (opts) {
          opts.template.should.equal("webpage");
          opts.hasBleed.should.equal(false);
          opts.loRes.should.equal(true);

          done();
        }
      });
      main.compileWebpage("filename", {}, function () {
        throw new Error("should not get here");
      });
    });
  });
});
