"use strict";

exports.flattenMultiDimentionalArray = function (array) {
  // from http://stackoverflow.com/a/10865042/484538
  return [].concat.apply([], array);
};

// currently assumes that body has no class
// this might cause problems down the line?
exports.getBodyContent = function (markup) {
  var startIndex = markup.indexOf("<body>") + 6,
    endIndex = markup.indexOf("</body>");
  return markup.slice(startIndex, endIndex);
};
