/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var phantom = require("node-phantom"),
  phantomInstance;

exports.getInstance = function (callback) {
  if (phantomInstance) {
    callback(null, phantomInstance);
  } else {
    phantom.create(function (err, phantom) {
      phantomInstance = phantom;
      callback(err, phantomInstance);
    });
  }
};

exports.cleanup = function (callback) {
  if (phantomInstance) {
    phantomInstance.exit(function () {
      phantomInstance._phantom.kill("SIGTERM");
      callback();
    });
  } else {
    callback();
  }
};

exports.getPage = function (callback) {

  function gotPhantomInstance(err, instance) {
    if (err) {
      callback(err);
      return;
    }

    instance.createPage(callback);
  }

  exports.getInstance(gotPhantomInstance);
};
