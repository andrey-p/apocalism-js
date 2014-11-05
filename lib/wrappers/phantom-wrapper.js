"use strict";

var fs = require("fs"),
  ecto = require("ectoplasm"),
  phantomjs = require("phantomjs"),
  arg = require("arg-err");

exports.cleanup = ecto.cleanup;

/*jslint unparam:true*/
exports.init = function (options, callback) {
  ecto.initialize({
    "create-page": __dirname + "/../phantom-scripts/create-page.js",
    "create-pdf-page": __dirname + "/../phantom-scripts/create-pdf-page.js"
  }, {
    phantomPath: phantomjs.path
  }, callback);
};
/*jslint unparam:false*/

exports.createPage = function (args, callback) {
  var err = arg.err(args, {
      blankPage: "string",
      dimensions: { width: "number", height: "number" },
      markup: "string"
    }),
    inputData;

  if (err) { return callback(err); }

  // strip HTML comments as they choke the pagination script
  args.markup = args.markup.replace(/<!--[\s\S]*?-->/g, "");

  // strip empty paragraphs - they appear sometimes in the
  // process of paginating and can potentially break styling
  args.markup = args.markup.replace(/<p><\/p>/g, "");

  inputData = {
    page: args.blankPage,
    overflow: args.markup,
    dimensions: args.dimensions
  };

  ecto.run("create-page", inputData, callback);
};

exports.generatePdfPage = function (args, callback) {
  var err = arg.err(args, {
      pathToPdf: "string",
      dimensions: { width: "number", height: "number" },
      markup: "string"
    });

  if (err) { return callback(err); }

  ecto.run("create-pdf-page", args, callback);
};
