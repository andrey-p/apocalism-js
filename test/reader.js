/*jslint indent: 2, node: true, nomen: true*/
/*globals it, describe, beforeEach, afterEach, after, before*/
"use strict";

var should = require("should"),
  reader = require("../lib/reader.js"),
  monkey = require("monkey-patch"),
  fs = require("fs"),
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
        "back-cover",
        "inside-front-cover",
        "inside-back-cover",
        "front-matter",
        "back-matter"
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
    it("should fall back to images whenever a corresponding markdown file doesn't exist", function (done) {
      // front-matter.md exists in the folder structure,
      // so it shouldn't check for existing pngs
      var filesLeftToRead = [
        "front-cover",
        "back-cover",
        "inside-front-cover",
        "inside-back-cover",
        "back-matter"
      ];

      monkey.patch(fs, {
        stat: function (filename, callback) {
          var i;

          // remove files that have been looked for
          for (i = 0; i < filesLeftToRead.length; i += 1) {

            if (filename.indexOf("front-matter.png") > -1) {
              throw new Error("shouldn't be checking for front-matter since md file exists");
            }

            if (filename.indexOf(filesLeftToRead[i] + ".png") > -1) {
              filesLeftToRead.splice(i, 1);
              break;
            }
          }

          // pass to patched method
          fs.___monkey.stat(filename, callback);
        }
      });

      reader.read(function (err) {
        should.not.exist(err);
        filesLeftToRead.length.should.equal(0);
        done();
      });
    });
  });
});
