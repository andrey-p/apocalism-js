#!/usr/bin/nodejs
/*jslint indent: 2, node: true*/
"use strict";

var program = require("commander"),
  main = require("../index.js"),
  options = require("../lib/options.js"),
  version = require("../package.json").version;

program
  .version(version)
  .usage("[options] <file>")
  .option("-q, --quiet", "don't output progress info")
  .option("--ignore-blank", "don't output blank pages")
  .option("--no-bleed", "don't add bleed")
  .option("--no-concat", "output a file per page as opposed to a single file")
  .option("--lo-res", "use low resolution images")
  .option("-o, --output [format]", "output format, possible values pdf (default) and html", "pdf")
  .option("--no-images", "assume this project uses no images (speeds things up and prevents things breaking if an images folder isn't found")
  .option("--webpage", "shorthand for -o html --lo-res --no-bleed --ignore-blank")
  .option("--download", "shorthand for -o pdf --lo-res --no-bleed --ignore-blank")
  .option("--debug", "shorthand for -o html --no-concat (useful for debugging layout issues)")
  .parse(process.argv);

if (program.output !== "pdf" && program.output !== "html") {
  console.error("Error: expected output format to be either pdf or html");
  process.exit();
}

if (program.webpage) {
  program.output = "html";
  program.loRes = true;
  program.bleed = false;
  program.ignoreBlank = true;
}

if (program.download) {
  program.output = "pdf";
  program.loRes = true;
  program.bleed = false;
  program.ignoreBlank = true;
}

if (program.debug) {
  program.output = "html";
  program.concat = false;
}

main.compile(program.args[0], {
  output: program.output,
  quiet: program.quiet,
  hasBleed: program.bleed,
  concat: program.concat,
  images: program.images,
  loRes: program.loRes,
  ignoreBlank: program.ignoreBlank
});
