/*jslint indent: 2, node: true*/
/*globals it, describe, after, beforeEach, afterEach, before*/
"use strict";

var should = require("should"),
  options = require("../lib/options.js"),
  template = require("../lib/template.js"),
  paginator = require("../lib/paginator.js"),
  monkey = require("monkey-patch"),
  phantomWrapper = require("../lib/phantom-wrapper.js"),
  lipsum = require("lorem-ipsum"),
  helper = require("./helper.js"),
  opts = helper.getDefaultOpts();

describe("paginator", function () {
  before(function (done) {
    paginator.init(opts, function () {
      done();
    });
  });
  describe("#paginate()", function () {
    var args;

    beforeEach(function () {
      args = {
        templateName: "pdf",
        sectionName: "body",
        content: "<p>heyo!</p>"
      };
      monkey.patch(template, {
        getBlankPage: function () {
          return "<html></html>";
        }
      });
      monkey.patch(phantomWrapper, {
        createPage: function (args, callback) {
          should.exist(args);
          callback(null, "<html><p>heyo!</p></html>", "");
        }
      });
    });
    afterEach(function () {
      monkey.unpatch(template);
      monkey.unpatch(phantomWrapper);
    });
    it("should request a blank page from the template module with all the right classes", function (done) {
      var called = false;
      template.getBlankPage = function (templateName, data) {
        templateName.should.equal("page");
        (typeof data).should.equal("object");
        data.pageNumber.should.equal(1);
        (data.classes instanceof Array).should.equal(true);
        data.classes.should.include(args.sectionName);
        data.classes.should.include("verso");
        data.classes.should.include("page-1");

        called = true;
        return "<html></html>";
      };
      paginator.paginate(args, function (err) {
        called.should.equal(true);
        should.not.exist(err);
        done();
      });
    });
    it("should call the createPage method on the phantomWrapper with all the right args", function (done) {
      var called = false;
      phantomWrapper.createPage = function (args, callback) {
        should.exist(args);
        args.blankPage.should.equal("<html></html>");
        args.markup.should.equal("<p>heyo!</p>");
        called = true;
        callback(null, "<html><p>heyo!</p></html>", "");
      };
      paginator.paginate(args, function (err) {
        called.should.equal(true);
        should.not.exist(err);
        done();
      });
    });
    it("should call the createPage method twice if it returns a leftover the first time round", function (done) {
      var times = 0;
      phantomWrapper.createPage = function (args, callback) {
        var leftover = "";
        should.exist(args);
        times += 1;

        if (times === 1) {
          leftover = "<p>I'm a leftover!</p>";
        }

        callback(null, "<html><p>heyo!</p></html>", leftover);
      };
      paginator.paginate(args, function (err) {
        times.should.equal(2);
        should.not.exist(err);
        done();
      });
    });
    it("should return no empty pages if the ignoreBlank option is true", function (done) {
      phantomWrapper.createPage = function (args, callback) {
        should.exist(args);

        console.log("runs");
        callback(null, "<html></html>", "");
      };

      opts.ignoreBlank = true;

      paginator.init(opts, function () {
        paginator.paginate(args, function (err, pages) {
          should.not.exist(err);
          pages.should.eql([]);

          done();
        });
      });
    });
  });
  describe("#createStandalonePage()", function () {
    var args;

    beforeEach(function () {
      args = {
        sectionName: "body",
        content: "<p>heyo!</p>"
      };
      monkey.patch(template, {
        getBlankPage: function () {
          return "<html></html>";
        }
      });
      monkey.patch(phantomWrapper, {
        createPage: function (args, callback) {
          should.exist(args);
          callback(null, "<html><p>heyo!</p></html>", "");
        }
      });
    });
    afterEach(function () {
      monkey.unpatch(template);
      monkey.unpatch(phantomWrapper);
    });
    it("should request a blank page from the template module with all the right classes", function (done) {
      var called = false;
      template.getBlankPage = function (templateName, data) {
        templateName.should.equal("page");
        (typeof data).should.equal("object");
        (data.classes instanceof Array).should.equal(true);
        data.classes.should.include(args.sectionName);

        called = true;
        return "<html></html>";
      };
      paginator.createStandalonePage(args, function (err) {
        called.should.equal(true);
        should.not.exist(err);
        done();
      });
    });
    it("should call the createPage method on the phantomWrapper with all the right args", function (done) {
      var called = false;
      phantomWrapper.createPage = function (args, callback) {
        should.exist(args);
        args.blankPage.should.equal("<html></html>");
        args.markup.should.equal("<p>heyo!</p>");
        called = true;
        callback(null, "<html><p>heyo!</p></html>", "");
      };
      paginator.createStandalonePage(args, function (err) {
        called.should.equal(true);
        should.not.exist(err);
        done();
      });
    });
    it("should return an undefined page if the ignoreBlank is true and the page is blank", function (done) {
      phantomWrapper.createPage = function (args, callback) {
        should.exist(args);
        callback(null, "<html></html>", "");
      };

      opts.ignoreBlank = true;

      paginator.init(opts, function () {
        paginator.createStandalonePage(args, function (err, page) {
          should.not.exist(err);
          should.not.exist(page);
          done();
        });
      });
    });
  });
});
