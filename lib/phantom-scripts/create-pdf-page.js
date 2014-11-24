/*globals phantom: false*/
var fs = require("fs"),
  webpage = require("webpage"),
  system = require("system");

exports.run = function (args, callback) {
  "use strict";
  var pageContent = args.markup,
    pathToPdf = args.pathToPdf,
    page = webpage.create();

  pageContent = args.markup;
  pathToPdf = args.pathToPdf;

  // this changes the root of the page to the cwd
  // thereby fixing any problems with relatively targeted images
  // see http://stackoverflow.com/questions/20100272/phantomjs-can-i-access-relative-assets-from-a-page-with-dynamically-set-content
  pageContent = pageContent.replace("<head>", "<head><base href=\"file://" + fs.workingDirectory + "/\">");
  page.content = pageContent;
  page.paperSize = {
    width: args.dimensions.width + "mm",
    height: args.dimensions.height + "mm",
    border: "0mm"
  };
  // give the page a chance to load before rendering
  page.onLoadFinished = function () {
    page.render(pathToPdf);
    callback(null, pathToPdf);
  };
};
