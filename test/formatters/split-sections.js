"use strict";

var should = require("should"),
  splitter = require("../../lib/formatters/split-sections");

describe("sectionSplitter", function () {
  it("should split a section when it encounters 3 or more equal signs surrounded by blank lines", function (done) {
    var input = [
      {
        content: "should\n\n===\n\nsplit",
        section: "body"
      }
    ];

    splitter(input, function (err, output) {
      should.not.exist(err);

      output.should.have.lengthOf(2);
      output[0].content.should.equal("should");
      output[0].section.should.equal("body");
      output[1].content.should.equal("split");
      output[1].section.should.equal("body");
      done();
    });
  });
  it("should not split unless if equal signs are not surrounded by blank lines", function (done) {
    var input = [
      {
        content: "should not====split",
        section: "body"
      }
    ];

    splitter(input, function (err, output) {
      should.not.exist(err);

      output[0].content.should.equal(input[0].content);
      done();
    });
  });
  it("should not split if it's less than 3 equal signs", function (done) {
    var input = [
      {
        content: "should not\n\n==\n\nsplit",
        section: "body"
      }
    ];

    splitter(input, function (err, output) {
      should.not.exist(err);

      output[0].content.should.equal(input[0].content);
      done();
    });
  });
});
