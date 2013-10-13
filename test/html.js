/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, before*/
"use strict";

var should = require("should"),
  html = require("../html.js"),
  w3c = require("w3c-validate").createValidator(),
  helper = require("./helper.js"),
  phantomWrapper = require("../phantom-wrapper.js");

describe("html", function () {
  describe("#generateFromMarkdown()", function () {
    var validMarkdown;
    before(function () {
      validMarkdown = "Hello *world*.\n\n";
      validMarkdown += "This is a list:\n\n";
      validMarkdown += "- item 1\n";
      validMarkdown += "- item 2\n";
    });
    after(function (done) {
      phantomWrapper.cleanup(function () {
        helper.killProcess("phantomjs", done);
      });
    });
    it("should take markdown and produce a valid HTML string", function (done) {
      html.generateFromMarkdown(validMarkdown, function (err, result) {
        should.not.exist(err);
        // the above should at the very least generate the following:
        result[0].should.include("<p>Hello <em>world</em>.</p>");
        result[0].should.include("<ul>");
        w3c.validate(result[0], done);
      });
    });
  });
});
