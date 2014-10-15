"use strict";

var should = require("should"),
  imageStripPTags = require("../../lib/formatters/image-strip-p-tags");

describe("imageStripPTags", function () {
  it("should strip paragraph tags from around an image", function (done) {
    var input = [{
      content: "<p><img src=\"" + __dirname + "/../images/mallard.png\"></p>",
      classes: ["body"],
      section: "body"
    }];

    imageStripPTags(input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      output.length.should.equal(1);
      output[0].content.should.not.containEql("<p>");
      output[0].content.should.not.containEql("</p>");

      done();
    });
  });
});
