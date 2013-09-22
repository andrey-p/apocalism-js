/*jslint indent: 2, node: true*/
"use strict";

var pandoc = require("pdc");

exports.generate = function (markdown, callback) {
  pandoc(markdown, "markdown", "html", function (err, result) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, result);
  });
};
