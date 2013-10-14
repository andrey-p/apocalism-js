/*jslint indent: 2, node: true*/
"use strict";

var namp = require("namp"),
  fs = require("fs"),
  sass = require("node-sass"),
  paginator = require("./paginator.js"),
  template = require("./template.js");

exports.generateFromMarkdown = function (bodyMarkdown, callback) {
  var bodyMarkup;

  function initialisedTemplate(err) {
    if (err) {
      callback(err);
      return;
    }

    paginator.paginate(template.getBlankPage(), bodyMarkup, callback);
  }

  bodyMarkup = namp(bodyMarkdown).html;

  template.init("default", initialisedTemplate);
};
