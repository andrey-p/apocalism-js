#!/usr/bin/nodejs
/*jslint indent: 2, node: true*/
"use strict";

var program = require("commander"),
  main = require("../index.js"),
  options = require("../lib/options.js"),
  version = require("../package.json").version;

program
  .version(version)
  .option("-q, --quiet", "Don't output progress info")
  .option("-d, --debug", "Output individual html pages in output/debug folder (useful for tweaking PDF layouts)")
  .option("--ignore-blank", "Don't output blank pages")
  .usage("[command] <file>");

program
  .option("--no-bleed", "PDF only: Don't add bleed")
  .option("--lo-res", "PDF only: Use low resolution images")
  .command("* <file>")
  .action(function (filename, options) {
    main.compilePdf(filename, {
      quiet: program.quiet,
      hasBleed: program.bleed,
      loRes: program.loRes,
      debug: program.debug,
      ignoreBlank: program.ignoreBlank
    });
  });

program
  .command("webpage <file>")
  .action(function (filename, option) {
    main.compileWebpage(filename, {
      quiet: program.quiet,
      ignoreBlank: program.ignoreBlank
    });
  });

program.parse(process.argv);
