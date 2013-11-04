/*jslint indent: 2*/
/*globals document: false, phantom: false*/
(function () {
  "use strict";
  var fs = require("fs"),
    page = require("webpage").create(),
    system = require("system"),
    pageContentPath = system.args[1],
    overflowPath = system.args[2],
    width = system.args[3],
    height = system.args[4],
    pageContent,
    overflow;

  pageContent = fs.read(pageContentPath);
  overflow = fs.read(overflowPath);
  page.content = pageContent;
  page.viewportSize = { width: width, height: height };

  overflow = page.evaluate(function (markup) {
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
        // if paragraph is 3 or more = signs
        // break page
        if (nodeToMove.innerHTML && nodeToMove.innerHTML.match(/^={3,}$/)) {
          overflowContainer.removeChild(nodeToMove);
          return;
        }
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
    } catch (e) {
      return "Error: " + e.toString();
    }

    return leftover; // to be populated with leftover text
  }, overflow);

  pageContent = page.content;

  fs.write(pageContentPath, pageContent, "w");
  fs.write(overflowPath, overflow, "w");

  phantom.exit();
}());
