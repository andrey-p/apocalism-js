"use strict";

var should = require("should"),
  styleParser = require("../../lib/parsers/style-parser"),
  monkey = require("monkey-patch"),
  helper = require("../helper"),
  dimensions = helper.getDefaultOpts().dimensions;

describe("style-parser", function () {
  describe("#getStyle()", function () {
    it("should output the predefined styles", function (done) {
      styleParser.getStyle(dimensions, function (err, css) {
        should.not.exist(err);
        should.exist(css);
        css.length.should.be.above(0);
        done();
      });
    });
  });
});
