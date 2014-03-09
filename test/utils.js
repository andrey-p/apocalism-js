"use strict";

var should = require("should"),
  utils = require("../lib/utils.js");

describe("utils", function () {
  describe("#flattenMultiDimentionalArray()", function () {
    it("should flatten the array provided", function () {
      var input = [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
        output = utils.flattenMultiDimentionalArray(input);

      output.should.eql([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });
  describe("#getBodyContent()", function () {
    it("should return everything inside the body tag", function () {
      var markup = "<html><head></head><body><h1>foo</h1><p>bar!</p></body></html>",
        result = utils.getBodyContent(markup);

      result.should.equal("<h1>foo</h1><p>bar!</p>");
    });
  });
});
