"use strict";

var should = require("should"),
  parser = require("../../lib/parsers/markdown-parser.js");

describe("markdown-parser", function () {
  describe("#parseMarkdown()", function () {
    it("should add all the proper typographic entities", function () {
      var result = parser.parseMarkdown("\"word\" ... 'word' can't -- ---");
      result.should.containEql("&#8220;"); // opening double quote
      result.should.containEql("&#8221;"); // closing double quote
      result.should.containEql("&#8216;"); // opening single quote
      result.should.containEql("&#8217;"); // closing single quote
      result.should.containEql("&#8211;"); // en dash
      result.should.containEql("&#8212;"); // em dash
      result.should.containEql("&#8230;"); // ellipsis
    });
    it("should add the class 'opening' to the first paragraph and mark the first letter as the cap", function () {
      var result,
        input = "# heading\n\n";
      input += "para1\n\n";
      input += "para2\n\n";

      result = parser.parseMarkdown(input);
      result.should.containEql("<p class=\"opening\"><span class=\"cap\">p</span>ara1</p>");
      result.should.not.containEql("<p class=\"opening\"><span class=\"cap\">p</span>ara2</p>");
    });
    it("should add classes to block level elements properly", function () {
      var result, input;

      input = "# heading\n";
      input += "{foo bar}\n\n";
      input += "paragraph1\n";
      input += "{bar}\n\n";
      input += "paragraph2\n";
      input += "{baz}\n\n";

      result = parser.parseMarkdown(input);
      result.should.containEql("<h1 class=\"foo bar\">heading</h1>");
      result.should.containEql("<p class=\"bar opening\"><span class=\"cap\">p</span>aragraph1</p>");
      result.should.containEql("<p class=\"baz\">paragraph2</p>");
    });
    it("should add classes to inline level elements properly", function () {
      var result, input;

      input = "hello *hello{foo}* *hello{bar baz}*!";

      result = parser.parseMarkdown(input);
      result.should.containEql("<em class=\"foo\">hello</em> <em class=\"bar baz\">hello</em>!");
    });
    it("should add classes to unordered lists", function () {
      var result, input;

      input = "- foo\n"
        + "- bar\n"
        + "{baz}\n";

      result = parser.parseMarkdown(input);
      result.should.containEql("<ul class=\"baz\">");
      result.should.containEql("<li>foo</li>");
      result.should.containEql("<li>bar</li>");
    });
    it("should NOT add '.opening' and cap to the first paragraph that's inside another element (ex. a blockquote)", function () {
      var result, input;

      input = "> para1\n>\n> para2\n\npara3";
      result = parser.parseMarkdown(input);
      result.should.not.containEql("<p class=\"opening\"><span class=\"cap\">p</span>ara1</p>");
      result.should.containEql("<p class=\"opening\"><span class=\"cap\">p</span>ara3</p>");
    });
    it("should NOT add a cap to non-alphanumeric characters", function () {
      var result, input;

      input = "===";
      result = parser.parseMarkdown(input);
      result.should.not.containEql("<p class=\"opening\"><span class=\"cap\">=</span>==</p>");
      result.should.containEql("<p class=\"opening\">===</p>");
    });
    it("should add a cap and give a quotation mark the quo class if it the opening para begins with a quote", function () {
      var result, input;

      input = "'Hello!'";
      result = parser.parseMarkdown(input);
      result.should.containEql("<p class=\"opening\"><span class=\"quo\">&#8216;</span><span class=\"cap\">H</span>ello!&#8217;</p>");

      input = "\"Hello!\"";
      result = parser.parseMarkdown(input);
      result.should.containEql("<p class=\"opening\"><span class=\"dquo\">&#8220;</span><span class=\"cap\">H</span>ello!&#8221;</p>");
    });
  });
});
