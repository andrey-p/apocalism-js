/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  html = require("../lib/html.js"),
  w3c = require("w3c-validate").createValidator(),
  helper = require("./helper.js"),
  phantomWrapper = require("../lib/phantom-wrapper.js");

describe("html", function () {
  describe("#fromMarkdown()", function () {
    it("should add all the proper typographic entities", function () {
      var result = html.fromMarkdown("\"word\" ... 'word' can't -- ---");
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
        input = "# heading\n\n";
      input += "para1\n\n";
      input += "para2\n\n";

      result = html.fromMarkdown(input);
      result.should.include("<p class=\"opening\">para1</p>");
      result.should.not.include("<p class=\"opening\">para2</p>");
    });
  });
  describe("#getBodyContent()", function () {
    it("should return everything inside the body tag", function () {
      var markup = "<html><head></head><body><h1>foo</h1><p>bar!</p></body></html>",
        result = html.getBodyContent(markup);

      result.should.equal("<h1>foo</h1><p>bar!</p>");
    });
  });
});
