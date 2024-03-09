#! /usr/bin/env node

import { Command } from 'commander';
import { build } from './commands/build.js';
import { init } from './commands/init.js';

const program = new Command();

program.name('stascii').description('A static site generator using AsciiDoc');

/** Init */
program.command('init').description('Initialize a new stascii project').action(init);

/** Build */
program.command('build').description('Build static site from AsciiDoc files').action(build);

program.parse(process.argv);
