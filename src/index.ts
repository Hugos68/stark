#! /usr/bin/env node

import { Command } from 'commander';
import { build } from './commands/build.js';

const program = new Command();

program.name('stascii').description('A static site generator using AsciiDoc');

/** Build */
program.command('build').description('Build static site from AsciiDoc files').action(build);

program.parse(process.argv);
