"use strict";

var fs = require("fs-extra"),
  arg = require("arg-err"),
  sass = require("node-sass"),
  async = require("async"),
  utils = require("../utils"),
  json2sass = require("json2sass"),
  stylePaths = [ // more are added to this
    __dirname + "/../assets/styles/mixins.scss",
    __dirname + "/../assets/styles/style.scss"
  ];

function parseScss(data, callback) {
  sass.render({
    data: data,
    outputStyle: "compressed",
    success: function (result) {
      callback(null, result.css);
    },
    error: function (err) {
      callback(err);
    }
  });
}

// gets both the user defined style and the default style
exports.getStyle = function (varsToInject, callback) {
  // these are the vars required by the default style.scss
  var err = arg.err({
    bleed: "number",
    stock: {
      width: "number",
      height: "number"
    },
    margin: {
      top: "number",
      bottom: "number",
      outer: "number",
      spine: "number"
    }
  }), varsToInjectScss;

  if (err) { return utils.nextTick(callback, err); }

  varsToInjectScss = json2sass.getContent(varsToInject, "scss");

  async.map(stylePaths,
    fs.readFile,
    function (err, styles) {
      if (err) { return callback(err); }

      styles.unshift(varsToInjectScss);

      parseScss(styles.join("\n\n"), callback);
    });
};

// registers a style that'll be added to the final css
exports.registerStyle = function (path, callback) {
  fs.exists(path, function (exists) {
    if (exists) {
      stylePaths.push(path);
      callback();
    } else {
      callback("Attempted to register style file that doesn't exist: " + path);
    }
  });
};
