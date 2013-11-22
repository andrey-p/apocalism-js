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
  .usage("[command] <file>");

program
  .option("--no-bleed", "PDF only: Don't add bleed")
  .command("* <file>")
  .action(function (filename, options) {
    main.compilePdf(filename, {
      quiet: program.quiet,
      hasBleed: program.bleed
    });
  });

program
  .command("webpage <file>")
  .action(function (filename, option) {
    main.compileWebpage(filename, {
      quiet: program.quiet
    });
  });

program.parse(process.argv);
