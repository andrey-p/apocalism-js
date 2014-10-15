"use strict";

var path = require("path"),
  async = require("async"),
  fs = require("fs-extra"),
  styleParser = require("./parsers/style-parser"),
  foldersToCreate = [],
  options = require("./options");

// this gets all the files in the current folder
// and calls "init" on them if they expose it
function initialiseModules(opts, callback) {
  fs.readdir(__dirname, function (err, files) {
    if (err) { return callback(err); }

    files = files.filter(function (file) {
      // leave only .js files
      return file.indexOf(".js") === file.length - 3
        // that aren't this file
        && file !== "initialiser.js"
        // or the main module
        && file !== "main.js";
    });

    // add this manually as it's the only module not in the main lib folder
    // that needs initialising
    files.push("wrappers/phantom-wrapper.js");

    async.each(files,
      function (file, callback) {
        var module = require("./" + file);

        if (typeof module.init === "function") {
          module.init(opts, callback);
        } else {
          callback();
        }
      }, callback);
  });
}

function getManifest() {
  var manifest;
  // if manifest doesn't exist, just assume an empty object
  try {
    manifest = require(process.cwd() + "/story.json");
  } catch (e) {
    manifest = {};
  }

  return manifest;
}

function registerUserStyleIfExists(callback) {
  var pathToUserStyle = process.cwd() + "/style.scss";

  fs.exists(pathToUserStyle, function (exists) {
    if (exists) {
      styleParser.registerStyle(pathToUserStyle, callback);
    } else {
      callback();
    }
  });
}

function addStyleToOptions(opts, callback) {
  async.waterfall([
    registerUserStyleIfExists,
    async.apply(styleParser.getStyle, opts.dimensions)
  ], function (err, css) {
    if (err) { return callback(err); }

    opts.css = css;

    callback(null, opts);
  });
}

exports.run = function (filename, optionsFromCli, callback) {
  var manifest,
    prop;

  // change the pwd to the working file
  process.chdir(path.dirname(filename));

  // get any options from the manifest and add them to options hash
  manifest = getManifest();
  for (prop in manifest) {
    if (manifest.hasOwnProperty(prop)) {
      optionsFromCli[prop] = manifest[prop];
    }
  }

  // this is needed for output
  optionsFromCli.filename = path.basename(filename, ".md");

  async.waterfall([
    async.apply(options.set, optionsFromCli),
    addStyleToOptions,
    initialiseModules
  ], callback);
};
