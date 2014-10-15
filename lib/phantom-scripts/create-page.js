/*globals document: false, phantom: false*/
var fs = require("fs"),
  webpage = require("webpage"),
  system = require("system");

function evaluateCallback(markup) {
  "use strict";
  var leftover = "",
    container,
    overflowContainer,
    imgPrepend = "",
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
    } else if (lastNode.data && lastNode.data.length > 0) {
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


  // add all of the content to the overflow container element
  container = document.getElementsByClassName("text-block")[0];
  overflowContainer = document.createElement("div");
  overflowContainer.innerHTML = markup;

  moveElementsUntilOveflowing();

  // in some cases an image at the end of some text is causing an overflow
  // so it leaves a massive gap at the bottom of the page
  // if this gap can be filled by text that follows the image, do that
  if (container.lastElementChild && container.lastElementChild.tagName === "IMG"
      && overflowContainer.firstElementChild && splittableTags.indexOf(overflowContainer.firstElementChild.tagName) > -1) {
    imgPrepend = container.lastElementChild.outerHTML;
    container.lastElementChild.outerHTML = "";
    moveElementsUntilOveflowing();
  }

  // split elements unless
  // there's only one overflowing element in the container and it can't be split
  if ((container.childElementCount === 1 && splittableTags.indexOf(container.firstElementChild.tagName) > -1)
      || container.childElementCount > 1) {
    removeOverflowingElements(container);
  }

  // get all overflow
  leftover += overflowContainer.innerHTML.trim();

  leftover = imgPrepend + leftover;

  return leftover; // to be populated with leftover text
}

exports.run = function (args, callback) {
  "use strict";
  var errored = false,
    content,
    overflow,
    page;

  page = webpage.create();
  overflow = args.overflow;
  page.content = args.page;
  page.viewportSize = args.dimensions;

  page.onConsoleMessage = function (msg) {
    console.log(msg);
  };

  page.onError = function (msg) {
    errored = true;
    callback(msg);
  };

  setTimeout(function () {
    overflow = page.evaluate(evaluateCallback, overflow);

    content = page.evaluate(function () {
      var textBlock = document.getElementsByClassName("text-block")[0];
      return textBlock.innerHTML;
    });

    if (!errored) {
      callback(null, content.trim(), overflow);
    }
  }, 20);
};
