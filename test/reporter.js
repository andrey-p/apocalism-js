"use strict";

var should = require("should"),
  fs = require("fs-extra"),
  reporter = require("../lib/reporter"),
  stdout = require("test-console").stdout,
  async = require("async");

describe("reporter", function () {
  beforeEach(function (done) {
    reporter.init({ quiet: false }, done);
  });
  describe("#log()", function () {
    it("should output the first arg to stdout", function () {
      /*jslint stupid: true*/
      var output = stdout.inspectSync(function () {
        reporter.log("hello");
      });
      /*jslint stupid: false*/

      output[0].should.equal("hello\n");
    });
    it("should execute asyncronously any callback passed as the last argument", function (done) {
      var inspect = stdout.inspect();

      reporter.log("hello", function () {
        inspect.restore();
        inspect.output[0].should.equal("hello\n");
        done();
      });
    });
    it("should be able to plug into a normal waterfall process", function (done) {
      var inspect = stdout.inspect();

      async.waterfall([
        async.apply(reporter.log, "about to start reading"),
        async.apply(fs.readFile, __dirname + "/md/test.md", { encoding: "utf8" }),
        async.apply(reporter.log, "finished reading")
      ], function (err, text) {
        should.not.exist(err);
        should.exist(text);

        text.should.containEql("Lorem ipsum");

        inspect.restore();
        inspect.output.length.should.equal(2);
        inspect.output[0].should.equal("about to start reading\n");
        inspect.output[1].should.equal("finished reading\n");
        done();
      });

    });
  });
});
