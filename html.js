/*jslint indent: 2, node: true*/
"use strict";

var pandoc = require("pdc"),
  fs = require("fs"),
  phantomWrapper = require("./phantom-wrapper.js"),
  sass = require("node-sass"),
  stock = require("./dimensions.js").stock,
  margin = require("./dimensions.js").margin;

exports.getNewEmptyPageMarkup = function (args) {
  var htmlMarkup,
    dimensionsInlineCss,
    width = stock.width + stock.bleed * 2 - (margin.outer + margin.spine),
    height = stock.height + stock.bleed * 2 - (margin.top + margin.bottom);

  dimensionsInlineCss = "width:" + width + "mm;"
    + "height:" + height + "mm;"
    + "margin:" + margin.top + "mm " + margin.spine + "mm " + margin.bottom + "mm " + margin.outer + "mm;";

  htmlMarkup = "<html>";
  htmlMarkup += "<head>";
  if (args && args.headMarkup) {
    htmlMarkup += args.headMarkup;
  }
  if (args && args.css) {
    htmlMarkup += "<style type='text/css'>" + args.css + "</style>";
  }
  htmlMarkup += "</head>";
  htmlMarkup += "<body style='" + dimensionsInlineCss + "'>";
  htmlMarkup += "<div id='container' style='width: 100%; height: 100%; overflow: hidden;'>";
  htmlMarkup += "</div>";
  htmlMarkup += "</body>";
  htmlMarkup += "</html>";

  return htmlMarkup;
}

exports.createPage = function (emptyPage, markup, callback) {
  var page,
    pageMarkup = "",
    leftoverMarkup = "";

  function gotContent(err, pageMarkup) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, pageMarkup, leftoverMarkup);
  }

  function filledPage(err, leftover) {
    if (err) {
      callback(err);
      return;
    }

    if (leftover && leftover.indexOf("Error: ") === 0) {
      callback(leftover);
      return;
    }

    leftoverMarkup = leftover;

    page.get("content", gotContent);
  }

  function setContent(err) {
    if (err) {
      callback(err);
      return;
    }

    setTimeout(function () {
      page.evaluate(function (markup) {
        var leftover = "",
          lastElement,
          container,
          body;

        function removeParagraph() {
          var lastWordIndex;

          // return if container doesn't overflow anymore
          if (container.clientHeight >= container.scrollHeight) {
            return;
          }

          lastElement = container.lastChild;
          container.removeChild(lastElement);
          // if this last paragraph was the difference between container overflowing or not
          if (container.clientHeight >= container.scrollHeight) {
            // readd it...
            container.appendChild(lastElement);

            // and remove words one by one until it stops overflowing again
            while (container.clientHeight < container.scrollHeight) {
              lastWordIndex = lastElement.innerHTML.lastIndexOf(" ");
              leftover = lastElement.innerHTML.substring(lastWordIndex + 1) + " " + leftover;
              lastElement.innerHTML = lastElement.innerHTML.substring(0, lastWordIndex);
            }
          } else {
            leftover += lastElement.outerHTML;
            removeParagraph();
          }
        }

        try {
          // add all of the content to the container element
          body = document.body;
          container = document.getElementById("container");
          container.innerHTML = markup;

          // remove paragraphs until it doesn't overflow anymore
          removeParagraph();
        } catch (e) {
          return "Error: " + e.toString();
        }

        return leftover; // to be populated with leftover text
      }, filledPage, markup);
    }, 500);
  }

  function setViewSize(err) {
    if (err) {
      callback(err);
      return;
    }

    page.set("content", emptyPage, setContent);
  }

  function gotPage(err, pageInstance) {
    var width, height;

    if (err) {
      callback(err);
      return;
    }

    page = pageInstance;

    width = (stock.width + stock.bleed * 2 - (margin.outer + margin.spine)) * 300 / 25.4;
    height = (stock.height + stock.bleed * 2 - (margin.top + margin.bottom)) * 300 / 25.4;

    page.set("viewportSize", { width: width, height: height }, setViewSize);
  }

  phantomWrapper.getPage(gotPage);
};

// args at this point:
// - bodyMarkup (required)
// - headMarkup (optional)
// - css (optional)
exports.paginate = function (args, callback) {
  var htmlMarkup,
    pages = [],
    emptyPage = exports.getNewEmptyPageMarkup(args);

  if (!args.bodyMarkup) {
    callback("bodyMarkup wasn't passed in");
    return;
  }

  function createdPage(err, page, leftover) {
    if (err) {
      callback(err);
      return;
    }

    pages.push(page);

    if (leftover && leftover.length) {
      exports.createPage(emptyPage, leftover, createdPage);
    } else {
      callback(null, pages);
    }
  }

  exports.createPage(emptyPage, args.bodyMarkup, createdPage);
};

exports.generateFromMarkdown = function (markdown, callback) {
  var headMarkup,
    bodyMarkup;

  function convertedSassToCss(err, result) {
    var styleTag,
      allMarkup;
    if (err) {
      callback(err);
      return;
    }

    callback(null, allMarkup);
  }

  function gotHeadMarkup(err, result) {
    if (err) {
      callback(err);
      return;
    }

    headMarkup = result;

    sass.render({
      file: "./template/style.scss",
      success: function (css) {
        convertedSassToCss(null, css);
      },
      error: function (err) {
        convertedSassToCss(err);
      }
    });
  }

  function convertedMarkdownToHtml(err, result) {
    if (err) {
      callback(err);
      return;
    }

    bodyMarkup = result;

    fs.readFile("./template/head.html", { encoding: "utf-8" }, gotHeadMarkup);
  }
  pandoc(markdown, "markdown", "html", convertedMarkdownToHtml);
};
