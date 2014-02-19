/*jslint indent: 2, nomen: true, node: true*/
"use strict";

var fs = require("fs"),
  async = require("async"),
  spawn = require("child_process").spawn,
  http = require("http"),
  os = require("os"),
  socketIo = require("socket.io"),
  phantomjs = require("phantomjs"),
  arg = require("arg-err"),
  phantomProcess,
  socketServer,
  socketConnection,
  httpServer,
  currentScript = null;

/*
 * This uses a websockets method heavily borrowed from Alex Scheel Meyer's node-phantom
 * https://github.com/alexscheelmeyer/node-phantom
 */

exports.cleanup = function () {
  if (!currentScript) {
    return;
  }

  socketConnection.emit("input", "exit");
  socketConnection.removeAllListeners("output");
  phantomProcess.stderr.removeAllListeners("data");
  phantomProcess.stdout.removeAllListeners("data");
  httpServer.close();
  socketServer.set('client store expiration', 0);

  httpServer = null;
  socketServer = null;
  socketConnection = null;
  phantomProcess = null;
  currentScript = null;
};

function initScript(callback) {
  if (phantomProcess) {
    phantomProcess.kill();
  }

  /*jslint unparam: true*/
  httpServer = http.createServer(function (req, res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end('<html><head><script src="/socket.io/socket.io.js" type="text/javascript"></script><script type="text/javascript">\n'
      + 'window.onload=function(){\n'
      + 'var socket = new io.connect("http://" + window.location.hostname);\n'
      + 'socket.on("input", function(msg){\n'
      + 'alert(msg);\n'
      + '});\n'
      + 'window.socket = socket;\n'
      + '};\n'
      + '</script></head><body></body></html>');
  }).listen(function () {
    var port = httpServer.address().port;
    socketServer = socketIo.listen(httpServer, { "log level": 1 });

    phantomProcess = spawn(phantomjs.path, [
      __dirname + "/phantom-scripts/bridge.js",
      currentScript,
      port
    ]);

    phantomProcess.stdout.on('data', function (data) {
      return console.log('phantom says: ' + data);
    });

    socketServer.sockets.on("connection", function (socket) {
      socketConnection = socket;
      callback();
    });
  });
  /*jslint unparam: false*/
}

exports.initCreatePage = function (callback) {
  currentScript = "create-page";
  initScript(callback);
};

exports.initCreatePdfPage = function (callback) {
  currentScript = "create-pdf-page";
  initScript(callback);
};

exports.createPage = function (args, callback) {
  var err = arg.err(args, {
      blankPage: "string",
      dimensions: { width: "number", height: "number" },
      markup: "string"
    }),
    inputData;

  if (err) { return callback(err); }

  if (!currentScript || currentScript !== "create-page") {
    exports.cleanup();
    return exports.initCreatePage(function () {
      exports.createPage(args, callback);
    });
  }

  // strip HTML comments as they choke the pagination script
  args.markup = args.markup.replace(/<!--[\s\S]*?-->/g, "");

  inputData = {
    page: args.blankPage,
    overflow: args.markup,
    dimensions: args.dimensions
  };

  socketConnection.removeAllListeners("output");
  phantomProcess.stderr.removeAllListeners("data");

  phantomProcess.stderr.on("data", function (data) {
    callback(data);
  });

  socketConnection.on("output", function (response) {
    var updatedPage = response.page,
      updatedOverflow = response.overflow;

    callback(null, updatedPage, updatedOverflow);
  });

  socketConnection.emit("input", JSON.stringify(inputData));
};

exports.generatePdfPage = function (args, callback) {
  var err = arg.err(args, {
      pathToPdf: "string",
      dimensions: { width: "number", height: "number" },
      markup: "string"
    });

  if (err) { return callback(err); }

  if (!currentScript || currentScript !== "create-pdf-page") {
    exports.cleanup();
    return exports.initCreatePdfPage(function () {
      exports.generatePdfPage(args, callback);
    });
  }

  socketConnection.removeAllListeners("output");
  phantomProcess.stderr.removeAllListeners("data");

  phantomProcess.stderr.on("data", function (data) {
    callback(data);
  });

  socketConnection.on("output", function (response) {
    var pathToPdf = response.pathToPdf;

    callback(null, pathToPdf);
  });

  socketConnection.emit("input", JSON.stringify(args));
};
