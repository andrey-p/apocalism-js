"use strict";

var should = require("should"),
  toHtml = require("../../lib/formatters/to-html");

describe("toHtml", function () {
  it("should convert to markdown properly", function (done) {
    var input = [{
      content: "# heading",
      section: "body"
    }];
    toHtml(input, function (err, output) {
      should.not.exist(err);
      should.exist(output);
      output.length.should.equal(1);
      // more detailed markdown parser tests are in the parsers folder
      output[0].content.should.equal("<h1>heading</h1>");

      done();
    });
  });
  it("should add the section name as a class", function (done) {
    var input = [{
      content: "# heading",
      section: "body"
    }];
    toHtml(input, function (err, output) {
      should.not.exist(err);
      should.exist(output);
      output.length.should.equal(1);

      output[0].classes.should.be.instanceOf(Array);
      output[0].classes.length.should.equal(1);
      output[0].classes[0].should.equal("body");

      // it should still retain its original section
      output[0].section.should.equal("body");

      done();
    });
  });
});
