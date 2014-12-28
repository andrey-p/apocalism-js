"use strict";

var should = require("should"),
  reader = require("../lib/reader.js"),
  monkey = require("monkey-patch"),
  fs = require("fs"),
  allSections = require("../lib/common-data/sections"),
  helper = require("./helper.js"),
  opts = helper.getDefaultOpts();

describe("reader", function () {
  before(function (done) {
    // need to set cwd to md folder
    // as files are read from cwd
    process.chdir(__dirname + "/md");

    opts.pathToImages = "../images/";

    reader.init(opts, function () {
      done();
    });
  });
  describe("#read()", function () {
    afterEach(function () {
      monkey.unpatch(fs);
    });
    it("should return an array of text chunks formatted in the right way", function (done) {
      reader.read(function (err, chunks) {
        should.not.exist(err);
        should.exist(chunks);

        chunks.should.be.an.instanceOf(Array);

        chunks.forEach(function (chunk) {
          chunk.section.should.be.type("string");
          allSections.should.containEql(chunk.section);

          if (chunk.section === "body") {
            chunk.content.should.containEql("ipsum");
          }
        });

        done();
      });
    });
    it("should return null for sections that don't exist", function (done) {
      reader.read(function (err, chunks) {
        should.not.exist(err);
        should.exist(chunks);

        var hasBackMatter = false;

        chunks.forEach(function (chunk) {
          if (chunk.section === "back-matter") {
            should(chunk.content).equal(null);
            hasBackMatter = true;
          }
        });

        hasBackMatter.should.equal(true);

        done();
      });
    });
    it("should return an empty string for sections that are empty files", function (done) {
      reader.read(function (err, chunks) {
        should.not.exist(err);
        should.exist(chunks);

        var hasFrontMatter = false;

        chunks.forEach(function (chunk) {
          if (chunk.section === "front-matter") {
            chunk.content.should.equal("");
            hasFrontMatter = true;
          }
        });

        hasFrontMatter.should.equal(true);

        done();
      });
    });
    it("should read the main story file", function (done) {
      var fileHasBeenRead = false;

      monkey.patch(fs, {
        readFile: function (filename, arg2, arg3) {
          if (filename.indexOf("test.md") > -1) {
            fileHasBeenRead = true;
          }

          // pass to patched method
          fs.___monkey.readFile(filename, arg2, arg3);
        }
      });

      reader.read(function (err) {
        should.not.exist(err);
        fileHasBeenRead.should.equal(true);
        done();
      });
    });
    it("should read the secondary book files", function (done) {
      var filesLeftToRead = [
        "front-cover",
        "inside-front-cover",
        "front-matter",
        "back-matter",
        "inside-back-cover",
        "back-cover"
      ];

      monkey.patch(fs, {
        readFile: function (filename, arg2, arg3) {
          var i;

          // remove files that have been looked for
          for (i = 0; i < filesLeftToRead.length; i += 1) {
            if (filename.indexOf(filesLeftToRead[i] + ".md") > -1) {
              filesLeftToRead.splice(i, 1);
              break;
            }
          }

          // pass to patched method
          fs.___monkey.readFile(filename, arg2, arg3);
        }
      });

      reader.read(function (err) {
        should.not.exist(err);
        filesLeftToRead.length.should.equal(0);
        done();
      });
    });
    it("should throw an error if the content markdown file doesn't exist", function (done) {
      reader.init({ filename: "does-not-exist.md" }, function () {
        reader.read(function (err) {
          should.exist(err);
          err.should.containEql("Could not find");
          done();
        });
      });
    });
  });
});
