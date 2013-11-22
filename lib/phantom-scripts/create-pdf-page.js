/*jslint indent: 2*/
/*globals phantom: false*/
(function () {
  "use strict";
  var fs = require("fs"),
    page = require("webpage").create(),
    system = require("system"),
    pageContentPath = system.args[1],
    pdfPagePath = system.args[2],
    width = system.args[3],
    height = system.args[4],
    pageContent;

  pageContent = fs.read(pageContentPath);

  // this changes the root of the page to the cwd
  // thereby fixing any problems with relatively targeted images
  // see http://stackoverflow.com/questions/20100272/phantomjs-can-i-access-relative-assets-from-a-page-with-dynamically-set-content
  pageContent = pageContent.replace("<head>", "<head><base href=\"file://" + fs.workingDirectory + "/\">");
  page.content = pageContent;
  page.paperSize = {
    width: width + "mm",
    height: height + "mm",
    border: "0mm"
  };
  // give the page a chance to load before rendering
  setTimeout(function () {
    page.render(pdfPagePath);
    phantom.exit();
  }, 10);
}());
