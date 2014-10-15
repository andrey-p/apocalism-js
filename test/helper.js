"use strict";

var exec = require("child_process").exec;

exports.getDefaultOpts = function () {
  return {
    filename: "test",
    output: "pdf",
    dimensions: {
      stock: {
        width: 148,
        height: 210
      },
      margin: {
        top: 15,
        spine: 15,
        bottom: 20,
        outer: 15
      },
      bleed: 2
    },
    quiet: true,
    hiResDPI: 300,
    loResDPI: 96,
    hasBleed: true,
    concat: true,
    pathToOutput: "output",
    pathToImages: "images",
    pathToTmp: "output/tmp",
  };
};

exports.getSamplePages = function () {
  return [
    {
      order: 1,
      htmlContent: "<html><body><p>foo</p></body></html>"
    },
    {
      order: 2,
      htmlContent: "<html><body><p>bar</p></body></html>"
    }
  ];
};

exports.getDefaultCss = function () {
  return 'body{margin:0;padding:0;}.page-container{position:relative;width:118mm;height:175mm;overflow:hidden;padding-top:15mm;padding-bottom:19.4mm;padding-left:15mm;padding-right:15mm;}.page-container.recto{padding-left:15mm;padding-right:15mm;}.page-container.verso{padding-left:15mm;padding-right:15mm;}.page-container.body img,.page-container.front-matter img,.page-container.back-matter img{position:relative;}.page-container.front-cover .text-block,.page-container.back-cover .text-block{position:static;}.page-container.front-cover .text-block img,.page-container.back-cover .text-block img{left:-2mm;top:-2mm;position:absolute;}.page-container.has-bleed{padding-bottom:23.7mm;padding-left:17mm;padding-right:17mm;}.page-container.has-bleed.recto{padding-left:17mm;padding-right:17mm;}.page-container.has-bleed.verso{padding-left:17mm;padding-right:17mm;}.page-container.has-bleed.front-cover .text-block,.page-container.has-bleed.back-cover .text-block{position:static;}.page-container.has-bleed.front-cover .text-block img,.page-container.has-bleed.back-cover .text-block img{left:0mm;top:0mm;position:absolute;}.text-block{width:100%;height:100%;overflow:visible;position:relative;}.page-number{font-family:"DejaVu Serif",sans-serif;position:absolute;bottom:10mm;width:10mm;text-align:center;left:50%;margin-left:-5mm;}.has-bleed .page-number{bottom:12mm;}.front-matter .page-number,.back-matter .page-number{display:none;}h1,h2,h3,h4,h5{font-family:"DejaVu Serif",sans-serif;}p{font-family:"DejaVu Serif",sans-serif;font-size:12pt;line-height:1.5em;text-indent:1.5em;padding:0px;margin:0px;}hr+p{text-indent:0;}.body p.contd,.body p.opening{text-indent:0;}.body p.opening{position:relative;}.body p.opening .quo,.body p.opening .dquo{position:absolute;left:-7pt;}.body p.opening .cap{float:left;font-size:58pt;padding:0 4pt 0 0;line-height:58pt;margin-bottom:-10pt;}hr{border:0;margin-bottom:3em;}hr:first-child,hr:last-child{margin:1em auto;width:30mm;position:relative;text-align:center;color:black;}hr:first-child:after,hr:last-child:after{font-family:"DejaVu Serif",sans-serif;font-size:12pt;position:relative;content:"* * *";}';
};

// returns true if process exists
exports.checkIfProcessExists = function (processName, callback) {
  exec("pgrep " + processName, function (error, stdout) {
    // error code 1 means no matches
    if (error && error.code !== 1) {
      callback(error);
    } else {
      callback(null, !!stdout.length);
    }
  });
};

// kills all instances of process
exports.killProcess = function (processName, callback) {
  exec("pkill " + processName, function (error, stdout) {
    // error code 1 means no process of that name found,
    // which is ok for cleaning up
    if (error && error.code !== 1) {
      callback(error);
    } else {
      callback(null, stdout);
    }
  });
};

// output mimetype of file
exports.getFileMimeType = function (path, callback) {
  exec("file -b --mime-type " + path, function (error, stdout) {
    if (error) {
      callback(error);
    } else {
      callback(null, stdout);
    }
  });
};

exports.getPdfPaperSize = function (path, callback) {
  exec("pdfinfo " + path + " | grep \"Page size:.*\" | grep -Eo \"[0-9]+ x [0-9]+\"", function (error, stdout) {
    if (error) {
      callback(error);
    } else {
      callback(null, stdout);
    }
  });
};

exports.getPdfPageCount = function (path, callback) {
  exec("pdfinfo " + path + " | grep \"Pages:.*\" | grep -Eo \"[0-9]+\"", function (error, stdout) {
    if (error) {
      callback(error);
    } else {
      callback(null, Number(stdout.trim()));
    }
  });
};
