"use strict";

var should = require("should"),
  addOpening = require("../../lib/formatters/add-opening");

describe("addOpening", function () {
  it("should add an opening class to the first paragraph in body section", function (done) {
    var input = [
      {
        content: "para 1\n\npara 2",
        section: "body"
      },
      {
        content: "back matter ipsum",
        section: "back-matter"
      }
    ];

    addOpening(input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      output.should.have.lengthOf(2);
      output[0].content.should.containEql("para 1\n{opening}\n\npara 2");
      done();
    });
  });
  it("should NOT add an opening class to the first paragraph in a different section", function (done) {
    var input = [
      {
        content: "para 1\n\npara 2",
        section: "body"
      },
      {
        content: "back matter ipsum",
        section: "back-matter"
      }
    ];

    addOpening(input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      output.should.have.lengthOf(2);
      output[1].content.should.not.containEql("{opening}");
      done();
    });
  });
  it("should NOT add '.opening' and cap to the first paragraph that's inside another element (ex. a blockquote)", function (done) {
    var input = [
      {
        content: "> para1\n>\n> para2\n\npara3",
        section: "body"
      },
      {
        content: "back matter ipsum",
        section: "back-matter"
      }
    ];

    addOpening(input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      output[0].content.should.not.containEql("para1\n{opening}");
      output[0].content.should.containEql("para3\n{opening}");
      done();
    });
  });
  it("should not overwrite an opening paragraph's existing classes", function (done) {
    var input = [
      {
        content: "para 1\n{do-not-delete}",
        section: "body"
      }
    ];

    addOpening(input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      output[0].content.should.containEql("{do-not-delete opening}");
      done();
    });
  });
  it("should not add opening class to a setext style heading", function (done) {
    var input = [
      {
        content: "heading\n---\n\nheading\n===\n\npara 1",
        section: "body"
      }
    ];

    addOpening(input, function (err, output) {
      should.not.exist(err);
      should.exist(output);

      output[0].content.should.containEql("para 1\n{opening}");
      done();
    });
  });
});
