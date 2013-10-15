/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  html = require("../html.js"),
  w3c = require("w3c-validate").createValidator(),
  helper = require("./helper.js"),
  phantomWrapper = require("../phantom-wrapper.js");

describe("html", function () {
  describe("#generateAndPrepMarkup()", function () {
    it("should take markdown and produce a valid HTML string", function () {
      var result,
        validMarkdown;

      validMarkdown = "Hello *world*.\n\n";
      validMarkdown += "This is a list:\n\n";
      validMarkdown += "- item 1\n";
      validMarkdown += "- item 2\n";

      result = html.generateAndPrepMarkup(validMarkdown);
      // the above should at the very least generate the following:
      result.should.include("Hello <em>world</em>.");
      result.should.include("<ul>");
    });
    it("should add all the proper typographic entities", function () {
      var result = html.generateAndPrepMarkup("\"word\" ... 'word' can't -- ---");
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

      result = html.generateAndPrepMarkup(input);
      result.should.include("<p class=\"opening\">para1</p>");
      result.should.not.include("<p class=\"opening\">para2</p>");
    });
  });
});
