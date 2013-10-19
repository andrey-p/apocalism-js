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
        container,
        body,
        splittableTags = ["P", "A", "SPAN", "EM", "STRONG"];

      function removeOverflowingElements(parentElement) {
        var lastWordIndex,
          lastNode,
          lastWord,
          parentTagName;

        // nothing to do if top level container's stopped overflowing
        if (container.clientHeight >= container.scrollHeight) {
          return;
        }

        lastNode = parentElement.lastChild;
        parentElement.removeChild(lastNode);

        parentTagName = parentElement.tagName.toLowerCase();

        // if this last element was the difference between container overflowing
        // it may need to be split
        if (container.clientHeight >= container.scrollHeight) {

          if (lastNode.nodeType === 1 // if node is type element (ie a tag)
              && splittableTags.indexOf(lastNode.tagName) > -1 // only split P and inline tags
              && lastNode.innerHTML.indexOf(" ") > -1) { // can't split one word elements so don't bother

            // readd it...
            parentElement.appendChild(lastNode);

            // and recurse
            removeOverflowingElements(lastNode);

          } else if (lastNode.nodeType === 3 // if node is text element
              && lastNode.data) { // and is non-empty

            // readd it...
            parentElement.appendChild(lastNode);

            // prep leftover to wrap
            leftover = "</" + parentTagName + ">" + leftover;

            // and remove words one by one until it stops overflowing again
            while (container.clientHeight < container.scrollHeight) {
              lastWordIndex = lastNode.data.lastIndexOf(" ");
              lastWord = lastNode.data.substring(lastWordIndex + 1);

              leftover = lastWord + " " + leftover;
              lastNode.data = lastNode.data.substring(0, lastWordIndex);
            }

            if (lastNode.data.length > 0) {
              // contd class should have an indent 0
              leftover = "<" + parentTagName + " class='contd " + parentElement.className + "'>" + leftover;
            } else {
              leftover = "<" + parentTagName + ">" + leftover;
            }
          } else {
            leftover = lastNode.outerHTML + leftover;
          }

        } else if (lastNode.outerHTML) {
          leftover = lastNode.outerHTML + leftover;
        }

        removeOverflowingElements(parentElement);
      }

      try {
        // add all of the content to the container element
        body = document.body;
        container = document.getElementById("container");
        container.innerHTML = markup;

        // remove paragraphs until it doesn't overflow anymore
        removeOverflowingElements(container);
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

exports.paginate = function (content, callback) {
  var htmlMarkup,
    blankPage,
    pages = [],
    currentPage = 1,
    className = "recto";

  function createdPage(err, page, leftover) {
    if (err) {
      callback(err);
      return;
    }

    pages.push(page);

    if (leftover && leftover.length) {
      currentPage += 1;
      className = currentPage % 2 ? "verso" : "recto";
      blankPage = template.getBlankPage({ pageNumber: currentPage, className: className });
      exports.createPage(blankPage, leftover, createdPage);
    } else {
      callback(null, pages);
    }
  }

  blankPage = template.getBlankPage({
    pageNumber: currentPage,
    className: "recto"
  });

  exports.createPage(blankPage, content, createdPage);
};
