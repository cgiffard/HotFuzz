#!/usr/bin/env node

/*
       _           __        ____
      (_)___ _____/ /__     / __/_  __________  ___  _____
     / / __ `/ __  / _ \   / /_/ / / /_  /_  / / _ \/ ___/
    / / /_/ / /_/ /  __/  / __/ /_/ / / /_/ /_/  __/ /
 __/ /\__,_/\__,_/\___/  /_/  \__,_/ /___/___/\___/_/
/___/ Fuzzin' yo' jade for fun and profit

*/

var fs        = require("fs"),
    colors    = require("colors"),
    program   = require("commander"),
    path      = require("path"),
    jade      = require("jade"),
    manifest  = require("./package.json"),
    fuzzer    = require("./lib/fuzzer");

// Spit out banner
console.log(
    fs.readFileSync(__filename, "utf8")
        .split("\n").slice(3,10).join("\n").dim);

program
    .version(manifest.version)
    .option("-j --jade <path>",    "Specify a jade template to render")
    .option("-f --fixture <path>", "Specify a JSON fixture to pass to jade")
    .parse(process.argv);

if (!program.jade) {
    console.error("Please specify a jade file (-j) to test.".red);
    process.exit(1);
}

if (!program.fixture) {
    console.error("Please specify a fixture file (-f) to test from.".red);
    process.exit(1);
}

console.log("Loading fixture file %s...".cyan.dim, program.fixture);
var fixture = require(path.join(process.cwd(), program.fixture));

console.log("Loading and compiling jade template %s...".cyan.dim, program.jade);
var template =
    jade.compileFile(
        program.jade[0] === "/" ?
            program.jade :
            path.join(process.cwd(), program.jade));


// ---------- Let the fuzzing commence!
var events = fuzzer(fixture, template);

events.emit = function() {
    console.log(arguments[0]);
}


// console.log("\nConcluded with %d failures.".cyan, failures);

// if (failures) {
//     console.error((
//         "The template crashed at least once during fuzzing.\n" +
//         "Consider adding additional type checks where errors occurred."
//     ).red);
// }

// process.exit(failures);



//
//
// //fjsldfm
// console.error("\t\tFailed to render template: %s".red, message.split(/\n/)[0]);
// console.error("\t\t" + message.split(/\n/ig).slice(1).join("\n\t\t").red.dim);
