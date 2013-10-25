/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  template = require("../template.js"),
  options = require("../options.js");

describe("options", function () {
  describe("#set()", function () {
    var validInput;
    beforeEach(function () {
      validInput = {
        output: "test/path.pdf",
        pathToImages: "test/path/",
        template: "default",
        title: "test expectations",
        author: "testy mctest"
      };
    });
    it("should set all the options passed to it", function (done) {
      options.set(validInput, function (err) {
        var prop;
        should.not.exist(err);
        for (prop in validInput) {
          if (validInput.hasOwnProperty(prop)) {
            options[prop].should.equal(validInput[prop]);
          }
        }
        done();
      });
    });
    it("should should complain if options without a default aren't set", function (done) {
      delete validInput.title;
      options.set(validInput, function (err) {
        should.exist(err);
        done();
      });
    });
    it("should not set options that don't exist", function (done) {
      validInput.thisShouldNotBeSet = "this";
      options.set(validInput, function (err) {
        options.should.not.have.property("thisShouldNotBeSet");
        done();
      });
    });
    it("should set options even when keys aren't camel cased", function (done) {
      delete validInput.title;
      delete validInput.pathToImages;
      validInput.Title = "title";
      validInput["Path to images"] = "path/to/images";
      options.set(validInput, function (err) {
        should.not.exist(err);
        options.title.should.equal(validInput.Title);
        options.pathToImages.should.equal(validInput["Path to images"]);
        done();
      });
    });
    it("should parse the dimensions passed to stock correctly", function (done) {
      validInput.stock = "100x105mm";
      options.set(validInput, function (err) {
        should.not.exist(err);
        options.stock.width.should.equal(100);
        options.stock.height.should.equal(105);
        done();
      });
    });
    it("should parse the dimensions passed to bleed correctly", function (done) {
      validInput.bleed = "5mm";
      options.set(validInput, function (err) {
        should.not.exist(err);
        options.bleed.should.equal(5);
        done();
      });
    });
    it("should parse the dimensions passed to margin", function (done) {
      validInput.margin = "1 2mm 3mm 4mm";
      options.set(validInput, function (err) {
        should.not.exist(err);
        options.margin.top.should.equal(1);
        options.margin.outer.should.equal(2);
        options.margin.bottom.should.equal(3);
        options.margin.spine.should.equal(4);
        done();
      });
    });
    it("should initialise the template", function (done) {
      var tempInit = template.init;
      template.init = function (templateName, dimensions) {
        templateName.should.equal(validInput.template);
        dimensions.should.have.property("stock");
        dimensions.should.have.property("margin");
        dimensions.should.have.property("bleed");
        template.init = tempInit;
        done();
      };

      options.set(validInput, function (err) {
        throw new Error("should not get here");
      });
    });
  });
});
