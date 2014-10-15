"use strict";

var should = require("should"),
  helper = require("../helper"),
  opts = helper.getDefaultOpts(),
  args,
  imageAddAttributes = require("../../lib/formatters/image-add-attributes");

describe("imageAddAttributes", function () {
  beforeEach(function () {
    args = {
      hiResDPI: opts.hiResDPI,
      loResDPI: opts.loResDPI,
      loRes: true
    };
  });
  it("should add the image dimensions to the image tags in the provided chunks", function (done) {
    var input = [{
      content: "<img src=\"" + __dirname + "/../images/mallard.png\">",
      classes: ["body"],
      section: "body"
    }];

    imageAddAttributes(args, input, function (err, output) {
      var targetWidth, targetHeight;
      should.not.exist(err);
      should.exist(output);

      // size of images in test proj folder is 1280 x 800
      targetWidth = Math.floor(1280 * 96 / 300);
      targetHeight = Math.floor(800 * 96 / 300);

      output.length.should.equal(1);
      output[0].content.should.containEql("width=\"" + targetWidth + "\"");
      output[0].content.should.containEql("height=\"" + targetHeight + "\"");
      done();
    });
  });
  it("should add the image class to the image tags", function (done) {
    var input = [{
      content: "<img src=\"" + __dirname + "/../images/mallard.png\">",
      classes: ["body"],
      section: "body"
    }];

    imageAddAttributes(args, input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      output.length.should.equal(1);
      output[0].content.should.containEql("class=\"image-mallard\"");
      done();
    });
  });
});
