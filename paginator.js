/*jslint indent: 2, node: true*/
/*globals document*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  template = require("./template.js");

exports.createPage = function (blankPage, content, callback) {
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

        // if it's a non-element node, ignore it
        if (lastElement.nodeType !== 1) {
          removeParagraph();
          return;
        }

        // if this last paragraph was the difference between container overflowing or not
        if (container.clientHeight >= container.scrollHeight
            && lastElement.tagName === "P"
            && lastElement.innerHTML.indexOf(" ") > -1) { // ignore single-word paragraphs
          // readd it...
          container.appendChild(lastElement);

          // prep leftover to wrap paragraph
          leftover = "</p>" + leftover;

          // and remove words one by one until it stops overflowing again
          while (container.clientHeight < container.scrollHeight) {
            lastWordIndex = lastElement.innerHTML.lastIndexOf(" ");
            leftover = lastElement.innerHTML.substring(lastWordIndex + 1) + " " + leftover;
            lastElement.innerHTML = lastElement.innerHTML.substring(0, lastWordIndex);
          }

          if (lastElement.innerHTML.length > 0) {
            // contd class should have an indent 0
            leftover = "<p class='contd " + lastElement.className + "'>" + leftover;
          } else {
            leftover = "<p>" + leftover;
          }
        } else {
          leftover = lastElement.outerHTML + leftover;
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
    }, filledPage, content);
  }

  function setViewSize(err) {
    if (err) {
      callback(err);
      return;
    }

    page.set("content", blankPage, setContent);
  }

  function gotPage(err, pageInstance) {
    var width, height;

    if (err) {
      callback(err);
      return;
    }

    page = pageInstance;

    width = (template.stock.width + template.stock.bleed * 2 - (template.margin.outer + template.margin.spine)) * 300 / 25.4;
    height = (template.stock.height + template.stock.bleed * 2 - (template.margin.top + template.margin.bottom)) * 300 / 25.4;

    page.set("viewportSize", { width: width, height: height }, setViewSize);
  }

  phantomWrapper.getPage(gotPage);
};

exports.paginate = function (blankPage, content, callback) {
  var htmlMarkup,
    pages = [];

  function createdPage(err, page, leftover) {
    if (err) {
      callback(err);
      return;
    }

    pages.push(page);

    if (leftover && leftover.length) {
      exports.createPage(blankPage, leftover, createdPage);
    } else {
      callback(null, pages);
    }
  }

  exports.createPage(blankPage, content, createdPage);
};
