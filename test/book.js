/*jslint indent: 2, node: true*/
/*globals it, describe, beforeEach, after, before, afterEach*/
"use strict";

var should = require("should"),
  helper = require("./helper.js"),
  book = require("../lib/book.js"),
  fs = require("fs"),
  pdf = require("../lib/pdf.js"),
  template = require("../lib/template.js"),
  paginator = require("../lib/paginator.js"),
  images = require("../lib/images.js"),
  monkey = require("monkey-patch"),
  opts = helper.getDefaultOpts();

describe("book", function () {
  describe("#compilePages()", function () {
    var sections;
    beforeEach(function (done) {
      sections = {
        "front-cover": "<p>front-cover</p>",
        "inside-front-cover": "<p>inside-front-cover</p>",
        "front-matter": "<p>front-matter</p>",
        "body": "<p>body</p>",
        "back-matter": "<p>back-matter</p>",
        "inside-back-cover": "<p>inside-back-cover</p>",
        "back-cover": "<p>back-cover</p>"
      };

      opts = helper.getDefaultOpts();
      book.init(opts, done);
    });
    afterEach(function () {
      monkey.unpatch(images);
      monkey.unpatch(paginator);
    });
    it("should resolve the images in all the sections", function (done) {
      var sectionsLeftToResolve = Object.keys(sections);
      monkey.patch(images, {
        resolveImagesInMarkup: function (args) {
          args.actualPathToImages.should.equal(opts.pathToImages);
          args.replacementPathToImages.should.equal(opts.pathToImages);

          // take off each section passed to this method
          sectionsLeftToResolve.forEach(function (sectionName, i) {
            if (args.markup === ("<p>" + sectionName + "</p>")) {
              sectionsLeftToResolve.splice(i, 1);
            }
          });

          // if none are left, test is successful
          if (sectionsLeftToResolve.length === 0) {
            done();
          }
        }
      });

      book.compilePages(sections, function () {
        throw new Error("should not get here");
      });
    });
    it("should save loRes images in the output folder if loRes is true", function (done) {
      monkey.patch(images, {
        saveImagesForScreen: function (sourcePath, targetPath) {
          sourcePath.should.equal(opts.pathToImages);
          targetPath.should.equal(opts.pathToOutput + "images/");

          done();
        }
      });

      opts.loRes = true;

      book.init(opts, function () {
        book.compilePages(sections, function () {
          throw new Error("should not get here");
        });
      });
    });
    it("should replace the path to the one containing lo res images if loRes is true", function (done) {
      var timesLeftToBeCalled = Object.keys(sections).length;
      monkey.patch(images, {
        saveImagesForScreen: function (sourcePath, targetPath, callback) {
          should.exist(sourcePath);
          should.exist(targetPath);

          callback();
        },
        resolveImagesInMarkup: function (args) {
          args.replacementPathToImages.should.equal(opts.pathToOutput + "images/");

          timesLeftToBeCalled -= 1;

          if (timesLeftToBeCalled === 0) {
            done();
          }
        }
      });

      opts.loRes = true;

      book.init(opts, function () {
        book.compilePages(sections, function () {
          throw new Error("should not get here");
        });
      });
    });
    it("should paginate all content sections", function (done) {
      var sectionsLeftToPaginate = ["back-matter", "body", "front-matter"];
      monkey.patch(images, {
        resolveImagesInMarkup: function (args, callback) {
          should.exist(args);
          callback(null, args.markup);
        }
      });

      monkey.patch(paginator, {
        paginate: function (args, callback) {
          // take off each section passed to this method
          sectionsLeftToPaginate.forEach(function (sectionName, i) {
            if (args.sectionName === sectionName) {
              args.content.should.equal("<p>" + sectionName + "</p>");
              sectionsLeftToPaginate.splice(i, 1);
            }
          });

          // if none are left, test is successful
          if (sectionsLeftToPaginate.length === 0) {
            done();
          } else {
            callback(null, ["foo", "bar"]);
          }
        }
      });

      book.compilePages(sections, function () {
        throw new Error("should not get here");
      });
    });
    it("should create standalone pages for all single page sections", function (done) {
      var sectionsLeftToPaginate = ["inside-front-cover", "inside-back-cover", "front-cover", "back-cover"];
      monkey.patch(images, {
        resolveImagesInMarkup: function (args, callback) {
          should.exist(args);
          callback(null, args.markup);
        }
      });

      monkey.patch(paginator, {
        paginate: function (args, callback) {
          should.exist(args);
          callback(null, ["foo", "bar"]);
        },
        createStandalonePage: function (args, callback) {
          // take off each section passed to this method
          sectionsLeftToPaginate.forEach(function (sectionName, i) {
            if (args.sectionName === sectionName) {
              args.content.should.equal("<p>" + sectionName + "</p>");
              sectionsLeftToPaginate.splice(i, 1);
            }
          });

          // if none are left, test is successful
          if (sectionsLeftToPaginate.length === 0) {
            done();
          } else {
            callback(null, "foo");
          }
        }
      });

      book.compilePages(sections, function () {
        throw new Error("should not get here");
      });
    });
    it("should return page objects (with page order and htmlContent) in the right order", function (done) {
      monkey.patch(images, {
        resolveImagesInMarkup: function (args, callback) {
          should.exist(args);
          callback(null, args.markup);
        }
      });

      monkey.patch(paginator, {
        paginate: function (args, callback) {
          callback(null, [args.content]);
        },
        createStandalonePage: function (args, callback) {
          callback(null, args.content);
        }
      });

      book.compilePages(sections, function (err, pages) {
        should.not.exist(err);
        var allSectionsInOrder = [
          "front-cover",
          "inside-front-cover",
          "front-matter",
          "body",
          "back-matter",
          "inside-back-cover",
          "back-cover"
        ];

        pages.forEach(function (page, i) {
          page.order.should.equal(i + 1);
          page.htmlContent.should.equal("<p>" + allSectionsInOrder[i] + "</p>");
        });

        done();
      });
    });
  });
  describe("#compilePdf()", function () {
    beforeEach(function (done) {
      book.init(opts, done);
    });
    afterEach(function () {
      monkey.unpatch(pdf);
    });
    it("should call the pdf.generatePdfFromPages method with all the pages", function (done) {
      var pagesToGenerateFrom = helper.getSamplePages();
      monkey.patch(pdf, {
        generatePdfFromPages: function (pages, filename) {
          pages.should.be.instanceOf(Array);
          pages.should.equal(pagesToGenerateFrom);

          filename.should.equal(opts.pathToOutput + opts.filename + ".pdf");

          done();
        }
      });

      book.compilePdf(pagesToGenerateFrom, function () {
        throw new Error("should not get here");
      });
    });
  });
  describe("#compileWebpage()", function () {
    afterEach(function () {
      monkey.unpatch(template);
      monkey.unpatch(fs);
    });
    it("should request a filled out html_layout page", function (done) {
      var pagesToGenerateFrom = helper.getSamplePages();
      monkey.patch(template, {
        getTemplatePage: function (templateName, templateArgs) {
          templateName.should.equal("html_layout");
          templateArgs.pagesMarkup.should.equal("<p>foo</p><p>bar</p>");

          return "there's your markup";
        }
      });

      monkey.patch(fs, {
        writeFile: function (filename, contents) {
          filename.should.equal(opts.pathToOutput + opts.filename + ".html");
          contents.should.equal("there's your markup");

          done();
        }
      });

      book.compileWebpage(pagesToGenerateFrom, function () {
        throw new Error("should not get here");
      });
    });
    it("should save the style assets to the output dir", function (done) {
      var pagesToGenerateFrom = helper.getSamplePages();

      monkey.patch(template, {
        getTemplatePage: function () {
          return "";
        },
        saveStyleAssetsToDir: function (path) {
          path.should.equal(opts.pathToOutput);

          done();
        }
      });

      monkey.patch(fs, {
        writeFile: function (filename, contents, callback) {
          should.exist(filename);
          should.exist(contents);

          callback();
        }
      });

      book.compileWebpage(pagesToGenerateFrom, function () {
        throw new Error("should not get here");
      });
    });
  });
});
