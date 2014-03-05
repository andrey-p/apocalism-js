/*jslint indent: 2, node: true, nomen: true*/
/*globals it, describe, beforeEach, afterEach, after, before*/
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
});
