/*jslint indent: 2, node: true*/
/*globals document*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  template = require("./template.js");

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
    emptyPage = template.getNewEmptyPageMarkup(args);

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
