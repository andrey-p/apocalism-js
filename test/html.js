/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before*/
"use strict";

var should = require("should"),
  html = require("../lib/html.js");

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
    it("should add classes to block level elements properly", function () {
      var result, input;

      input = "# heading\n";
      input += "{foo bar}\n\n";
      input += "paragraph1\n";
      input += "{bar}\n\n";
      input += "paragraph2\n";
      input += "{baz}\n\n";

      result = html.fromMarkdown(input);
      result.should.include("<h1 class=\"foo bar\">heading</h1>");
      result.should.include("<p class=\"bar opening\">paragraph1</p>");
      result.should.include("<p class=\"baz\">paragraph2</p>");
    });
    it("should add classes to inline level elements properly", function () {
      var result, input;

      input = "hello *hello{foo}* *hello{bar baz}*!";

      result = html.fromMarkdown(input);
      result.should.include("hello <em class=\"foo\">hello</em> <em class=\"bar baz\">hello</em>!");
    });
    it("should NOT add '.opening' to the first paragraph that's inside another element (ex. a blockquote)", function () {
      var result, input;

      input = "> para1\n>\n> para2\n\npara3";
      result = html.fromMarkdown(input);
      result.should.not.include("<p class=\"opening\">para1</p>");
      result.should.include("<p class=\"opening\">para3</p>");
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
