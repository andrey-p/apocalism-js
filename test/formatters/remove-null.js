"use strict";

var should = require("should"),
  removeNull = require("../../lib/formatters/remove-null");

describe("removeNull", function () {
  it("should remove all sections the content of which is null", function (done) {
    var input = [
      {
        content: "lorem ipsum",
        section: "body"
      },
      {
        content: null,
        section: "back-matter"
      }
    ];

    removeNull(input, function (err, output) {
      should.not.exist(err);

      output.should.have.lengthOf(1);
      output[0].section.should.equal("body");
      done();
    });
  });
});
