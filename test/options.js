/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  template = require("../lib/template.js"),
  options = require("../lib/options.js");

describe("options", function () {
  describe("#set()", function () {
    var validInput;
    beforeEach(function () {
      validInput = {
        pathToOutput: "test/",
        pathToImages: "test/path/",
        template: "pdf",
        title: "test expectations",
        author: "testy mctest"
      };
      options.reset();
    });
    it("should set all the options passed to it", function (done) {
      options.set(validInput, function (err, opts) {
        var prop;
        should.not.exist(err);
        for (prop in validInput) {
          if (validInput.hasOwnProperty(prop)) {
            opts[prop].should.equal(validInput[prop]);
          }
        }
        done();
      });
    });
    it("should should complain if options without a default aren't set", function (done) {
      delete validInput.title;
      options.set(validInput, function (err, opts) {
        should.exist(err);
        done();
      });
    });
    it("should not set options that don't exist", function (done) {
      validInput.thisShouldNotBeSet = "this";
      options.set(validInput, function (err, opts) {
        opts.should.not.have.property("thisShouldNotBeSet");
        done();
      });
    });
    it("should set options even when keys aren't camel cased", function (done) {
      delete validInput.title;
      delete validInput.pathToImages;
      validInput.Title = "title";
      validInput["Path to images"] = "path/to/images";
      options.set(validInput, function (err, opts) {
        should.not.exist(err);
        opts.title.should.equal(validInput.Title);
        opts.pathToImages.should.equal(validInput["Path to images"]);
        done();
      });
    });
    it("should parse the dimensions passed to stock correctly", function (done) {
      validInput.stock = "100x105mm";
      options.set(validInput, function (err, opts) {
        should.not.exist(err);
        opts.stock.width.should.equal(100);
        opts.stock.height.should.equal(105);
        done();
      });
    });
    it("should parse the dimensions passed to bleed correctly", function (done) {
      validInput.bleed = "5mm";
      options.set(validInput, function (err, opts) {
        should.not.exist(err);
        opts.bleed.should.equal(5);
        done();
      });
    });
    it("should parse the dimensions passed to margin", function (done) {
      validInput.margin = "1 2mm 3mm 4mm";
      options.set(validInput, function (err, opts) {
        should.not.exist(err);
        opts.margin.top.should.equal(1);
        opts.margin.outer.should.equal(2);
        opts.margin.bottom.should.equal(3);
        opts.margin.spine.should.equal(4);
        done();
      });
    });
  });
});
