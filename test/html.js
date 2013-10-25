/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  html = require("../html.js"),
  w3c = require("w3c-validate").createValidator(),
  helper = require("./helper.js"),
  phantomWrapper = require("../phantom-wrapper.js");

describe("html", function () {
  describe("#prepMarkup()", function () {
    it("should add all the proper typographic entities", function () {
      var result = html.prepMarkup("\"word\" ... 'word' can't -- ---");
      result.should.include("&#8220;"); // opening double quote
      result.should.include("&#8221;"); // closing double quote
      result.should.include("&#8216;"); // opening single quote
      result.should.include("&#8217;"); // closing single quote
      result.should.include("&#8211;"); // en dash
      result.should.include("&#8212;"); // em dash
      result.should.include("&#8230;"); // ellipsis
    });
    it("should add the class 'opening' to the first paragraph", function () {
      var result,
        input = "<h1>heading</h1>\n\n";
      input += "<p>para1</p>\n\n";
      input += "<p>para2</p>\n\n";

      result = html.prepMarkup(input);
      result.should.include("<p class=\"opening\">para1</p>");
      result.should.not.include("<p class=\"opening\">para2</p>");
    });
  });
});
