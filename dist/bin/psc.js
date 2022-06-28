#!/usr/bin/env node
const shell = require('shelljs');
const path = require('path');

console.log('Puppeteer-simple-cli work on: v1.0.9');
const root = path.resolve('', './');
shell.exec('node ' + root + '/node_modules/puppeteer-simple-cli-cores');
