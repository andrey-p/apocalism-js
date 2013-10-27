/*jslint indent: 2, node: true*/
/*globals document*/
"use strict";

var phantomWrapper = require("./phantom-wrapper.js"),
  options = require("./options.js"),
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
        overflowContainer,
        imgPrepend = "",
        body,
        splittableTags = ["P", "A", "SPAN", "EM", "STRONG"];

      function removeOverflowingElements(parentElement) {
        var lastWordIndex,
          lastNode,
          lastWord,
          tagName;

        // nothing to do if top level container's stopped overflowing
        if (container.clientHeight >= container.scrollHeight
            || !parentElement.lastChild) {
          return;
        }

        lastNode = parentElement.lastChild;
        parentElement.removeChild(lastNode);

        // if this last element was the difference between container overflowing
        // it may need to be split
        if (container.clientHeight >= container.scrollHeight) {

          if (lastNode.nodeType === 1 // if node is type element (ie a tag)
              && splittableTags.indexOf(lastNode.tagName) > -1 // only split P and inline tags
              && lastNode.innerHTML.indexOf(" ") > -1) { // can't split one word elements so don't bother

            tagName = lastNode.tagName.toLowerCase();

            // readd it...
            parentElement.appendChild(lastNode);

            // prep leftover to wrap
            leftover = "</" + tagName + ">" + leftover;

            // and recurse
            removeOverflowingElements(lastNode);

            // if the node has length 0, it means it overflowed completely
            // so it wasn't split, so don't give it contd class
            if (lastNode.innerHTML.length === 0) {
              leftover = "<" + tagName + " class='" + lastNode.className + "'>" + leftover;
            } else {
              leftover = "<" + tagName + " class='contd " + lastNode.className + "'>" + leftover;
            }

          } else if (lastNode.nodeType === 3 // if node is text element
              && lastNode.data) { // and is non-empty

            // readd it...
            parentElement.appendChild(lastNode);

            // and remove words one by one until it stops overflowing again
            while (container.clientHeight < container.scrollHeight) {
              lastWordIndex = lastNode.data.lastIndexOf(" ");
              lastWord = lastNode.data.substring(lastWordIndex + 1);

              leftover = lastWord + " " + leftover;
              lastNode.data = lastNode.data.substring(0, lastWordIndex);
            }

          } else {
            leftover = lastNode.outerHTML + leftover;
          }

        } else if (lastNode.outerHTML) {
          leftover = lastNode.outerHTML + leftover;
        } else if (lastNode.data && lastNode.data.length > 1) {
          leftover = lastNode.data + leftover;
        }

        removeOverflowingElements(parentElement);
      }

      function moveElementsUntilOveflowing() {
        var nodeToMove;
        while (container.scrollHeight <= container.clientHeight
            && overflowContainer.childElementCount) {
          nodeToMove = overflowContainer.firstElementChild;
          container.appendChild(nodeToMove);
        }
      }
      try {
        // add all of the content to the overflow container element
        body = document.body;
        container = document.getElementById("container");
        overflowContainer = document.createElement("div");
        overflowContainer.innerHTML = markup;

        moveElementsUntilOveflowing();

        if (container.lastElementChild && container.lastElementChild.innerHTML.indexOf("<img") > -1) {
          imgPrepend = container.lastElementChild.outerHTML;
          container.lastElementChild.outerHTML = "";
          moveElementsUntilOveflowing();
        }

        // get all overflow
        leftover += overflowContainer.innerHTML.trim();

        // remove paragraphs until it doesn't overflow anymore
        removeOverflowingElements(container);

        leftover = imgPrepend + leftover;
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

    width = (options.stock.width + options.bleed * 2 - (options.margin.outer + options.margin.spine)) * 300 / 25.4;
    height = (options.stock.height + options.bleed * 2 - (options.margin.top + options.margin.bottom)) * 300 / 25.4;

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
