"use strict";

var should = require("should"),
  imageFallback = require("../../lib/formatters/image-fallback");

describe("imageFallback", function () {
  it("should leave the content as a blank string if no image exists", function (done) {
    var input = [
      {
        content: "",
        section: "front-cover"
      }
    ];
    // won't find an image in the current dir
    imageFallback(__dirname, input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      output.length.should.equal(1);
      output[0].content.should.equal("");
      done();
    });
  });
  it("should fallback to an image if an image of the right extension does exist", function (done) {
    var input = [
      {
        content: "",
        section: "front-cover"
      }
    ];
    // images dir should have a fallback image
    imageFallback(__dirname + "/../images", input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      output.length.should.equal(1);
      output[0].content.should.equal("![front-cover](front-cover.png)");
      done();
    });
  });
  it("should leave sections not in the image fallback list as-is", function (done) {
    var input = [
      {
        content: "",
        section: "body"
      }
    ];
    imageFallback(__dirname + "/images", input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      output.length.should.equal(1);
      output[0].content.should.equal("");
      done();
    });
  });
});
