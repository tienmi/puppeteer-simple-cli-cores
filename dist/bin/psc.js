#!/usr/bin/env node
const shell = require("shelljs");
const path = require("path");
const package = require("../package.json");
console.log(`Puppeteer-simple-cli work on: v${package.version}`);
const root = path.resolve("", "./");
shell.exec("node " + root + "/node_modules/puppeteer-simple-cli-cores");
