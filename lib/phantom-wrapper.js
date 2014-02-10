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
  httpServer;

exports.cleanup = function () {
  socketConnection.emit("input", "exit");
  httpServer.close();
  socketServer.set('client store expiration', 0);

  httpServer = null;
  socketServer = null;
  socketConnection = null;
  phantomProcess = null;
};

function initScript(scriptName, callback) {
  if (phantomProcess) {
    phantomProcess.disconnect();
  }

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
      scriptName,
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
}

exports.initCreatePage = function (callback) {
  initScript("create-page", callback);
};

exports.createPage = function (args, callback) {
  var pathToBlankPage = os.tmpdir() + "/tmp_blank_page.html",
    pathToOverflow = os.tmpdir() + "/tmp_content.html",
    err = arg.err(args, {
      blankPage: "string",
      dimensions: { width: "number", height: "number" },
      markup: "string"
    }),
    inputData,
    outputData;

  if (err) { return callback(err); }

  // strip HTML comments as they choke the pagination script
  args.markup = args.markup.replace(/<!--[\s\S]*?-->/g, "");

  inputData = {
    page: args.blankPage,
    overflow: args.markup,
    dimensions: args.dimensions
  };

  // this is hacky. TODO, figure out how to remove previous event handlers properly
  socketConnection._events.output = [];

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
  var pathToHtml = os.tmpdir() + "/tmp_book_page.html",
    err = arg.err(args, {
      pathToPdf: "string",
      dimensions: { width: "number", height: "number" },
      markup: "string"
    });

  if (err) { return callback(err); }

  async.series([
    async.apply(fs.writeFile, pathToHtml, args.markup),
    async.apply(execFile, phantomjs.path, [
      __dirname + "/phantom-scripts/create-pdf-page.js",
      pathToHtml,
      args.pathToPdf,
      args.dimensions.width,
      args.dimensions.height
    ])
  ], function (err) {
    callback(err, args.pathToPdf);
  });
};
