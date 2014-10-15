"use strict";

var should = require("should"),
  initialiser = require("../lib/initialiser"),
  monkey = require("monkey-patch"),
  reader = require("../lib/reader"),
  styleParser = require("../lib/parsers/style-parser"),
  phantomWrapper = require("../lib/wrappers/phantom-wrapper"),
  helper = require("./helper");

describe("initialiser", function () {
  describe("#run()", function () {
    afterEach(function (done) {
      monkey.unpatch(styleParser);
      monkey.unpatch(reader);
      phantomWrapper.cleanup(done);
    });
    it("should run without error", function (done) {
      initialiser.run(__dirname + "/md/test.md", {}, function (err) {
        should.not.exist(err);
        done();
      });
    });
    it("should get the styles from the styleParser", function (done) {
      var wasCalled = false;

      monkey.patch(styleParser, {
        getStyle: function (vars, callback) {
          should.exist(vars);
          wasCalled = true;
          callback();
        }
      });

      initialiser.run(__dirname + "/md/test.md", {}, function (err) {
        should.not.exist(err);
        wasCalled.should.equal(true);
        done();
      });
    });
    it("should call init on modules in that folder", function (done) {
      var wasCalled = false;

      monkey.patch(reader, {
        init: function (vars, callback) {
          should.exist(vars);
          wasCalled = true;
          callback();
        }
      });

      initialiser.run(__dirname + "/md/test.md", {}, function (err) {
        should.not.exist(err);
        wasCalled.should.equal(true);
        done();
      });
    });
  });
});

