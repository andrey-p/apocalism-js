/*jslint indent: 2, node: true*/
"use strict";

exports.flattenMultiDimentionalArray = function (array) {
  // from http://stackoverflow.com/a/10865042/484538
  return [].concat.apply([], array);
};
