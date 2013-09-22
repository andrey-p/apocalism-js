#!/usr/bin/nodejs
/*jslint indent: 2, node: true*/
"use strict";

var program = require("commander");

function compilePdf(file) {
  console.log("compiling pdf...");
};

program
  .version("0.0.1")
  .usage("[command] <file>");

program
  .command("pdf <file>")
  .action(compilePdf);

program
  .command("*")
  .action(compilePdf);
  
program.parse(process.argv);
