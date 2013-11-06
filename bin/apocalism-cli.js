#!/usr/bin/nodejs
/*jslint indent: 2, node: true*/
"use strict";

var program = require("commander"),
  main = require("../index.js"),
  options = require("../lib/options.js");

program
  .version("0.0.10")
  .option("-q, --quiet", "Don't output progress info")
  .usage("[command] <file>");

program.parse(process.argv);

options.quiet = program.quiet;

main.compileBook(program.args[0]);
