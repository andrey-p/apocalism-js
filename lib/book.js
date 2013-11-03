/*jslint indent: 2, node: true*/
"use strict";

var paginator = require("./paginator.js"),
  pdf = require("./pdf.js"),
  images = require("./images.js"),
  options = require("./options.js");

exports.compile = function (sections, callback) {
  var sectionsBeforeContent = ["front-cover", "inside-front-cover"],
    sectionsAfterContent = ["inside-back-cover", "back-cover"],
    pages = [],
    sectionName;

  function generatedPdf(err, pathToPdf) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, pathToPdf);
  }

  function createdBackSection(err, sectionPage) {
    if (err) {
      callback(err);
      return;
    }

    pages.push(sectionPage);

    if (sectionsAfterContent.length === 0) {
      pdf.generatePdfFromPages(pages, options.output, generatedPdf);
    } else {
      sectionName = sectionsAfterContent.shift();
      paginator.createStandalonePage(sectionName, sections[sectionName], createdBackSection);
    }
  }

  function createdFrontSection(err, sectionPage) {
    if (err) {
      callback(err);
      return;
    }

    pages.unshift(sectionPage);

    if (sectionsBeforeContent.length === 0) {
      sectionName = sectionsAfterContent.shift();
      paginator.createStandalonePage(sectionName, sections[sectionName], createdBackSection);
    } else {
      sectionName = sectionsBeforeContent.pop();
      paginator.createStandalonePage(sectionName, sections[sectionName], createdFrontSection);
    }
  }

  function generatedBodyPages(err, bodyPages) {
    var imageTag;
    if (err) {
      callback(err);
      return;
    }

    pages = bodyPages.slice();

    sectionName = sectionsBeforeContent.pop();
    paginator.createStandalonePage(sectionName, sections[sectionName], createdFrontSection);
  }

  paginator.paginate(sections.content, generatedBodyPages);
};
