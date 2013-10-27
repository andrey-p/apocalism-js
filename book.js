/*jslint indent: 2, node: true*/
"use strict";

var paginator = require("./paginator.js"),
  pdf = require("./pdf.js"),
  images = require("./images.js"),
  options = require("./options.js");

exports.compile = function (markup, callback) {
  var pages;

  function generatedPdf(err, pathToPdf) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, pathToPdf);
  }

  function createdFrontCover(err, frontCover) {
    if (err) {
      callback(err);
      return;
    }

    pages.unshift(frontCover);

    pdf.generatePdfFromPages(pages, options.output, generatedPdf);
  }

  function resolvedFrontCoverImage(err, resolvedImageTag) {
    if (err) {
      callback(err);
      return;
    }

    paginator.createCover(resolvedImageTag, createdFrontCover);
  }

  function generatedBodyPages(err, bodyPages) {
    var imageTag;
    if (err) {
      callback(err);
      return;
    }

    pages = bodyPages.slice();

    imageTag = "<img src=\"front-cover.png\" />";

    images.resolveImageTag(imageTag, options.pathToImages, resolvedFrontCoverImage);
  }

  paginator.paginate(markup, generatedBodyPages);
};
