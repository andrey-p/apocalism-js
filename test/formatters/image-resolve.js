"use strict";

var should = require("should"),
  imageResolve = require("../../lib/formatters/image-resolve");

describe("imageResolve", function () {
  it("should add the image folder to all images in the text", function (done) {
    var input = [
      {
        section: "body",
        content: "something something\n\n![img](img.png)"
      }
    ];

    imageResolve("pathToImages", input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      input.length.should.equal(1);
      input[0].content.should.equal("something something\n\n![img](pathToImages/img.png)");
      done();
    });
  });
});
