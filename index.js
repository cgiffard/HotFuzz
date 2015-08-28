#!/usr/bin/env node

/*

        __  __      __     ____
       / / / /___  / /_   / __/_  __________
      / /_/ / __ \/ __/  / /_/ / / /_  /_  /
     / __  / /_/ / /_   / __/ /_/ / / /_/ /_
    /_/ /_/\____/\__/  /_/  \__,_/ /___/___/

    Have you ever compiled two templates...
    ...whilst jumping through the air and saying AAH!?

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
        .split("\n").slice(3,13).join("\n").dim);

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
var fixture = require(
    program.fixture[0] === "/" ?
        program.fixture :
        path.join(process.cwd(), program.fixture));

console.log("Loading and compiling jade template %s...".cyan.dim, program.jade);
var template =
    jade.compileFile(
        program.jade[0] === "/" ?
            program.jade :
            path.join(process.cwd(), program.jade));


// ---------- Let the fuzzing commence!
fuzzer(fixture, template)
    .on("startingIteration", function(iteration){
        console.log("Starting iteration number %s".cyan, iteration);
    })
    .on("transformingLeaves", function(fuzzerName){
        console.log("\tRunning leaf node fuzzer (%s)".cyan.dim, fuzzerName);
    })
    .on("testingRendering", function(fuzzerName){
        console.log("\tTesting rendering against fuzzer (%s)".cyan.dim, fuzzerName);
    })
    .on("testingRenderingOk", function(fuzzerName){
        console.log("\t\t -> Ok: Fuzzer (%s) rendered ok".green, fuzzerName);
    })
    .on("complete", function(failures){
        if (failures) {
            console.error((
                "\nConcluded with %d failures.".cyan +
                "\nThe template crashed at least once during fuzzing.\n".red +
                "Consider adding additional type checks where errors occurred.".red
            ), failures);
        } else {
            console.log("No failures".green);
        }

        process.exit(failures);
    })
    .on("renderFailed", function(message){
        console.error("\t\tFailed to render template: %s".red, message.split(/\n/)[0]);
        console.error("\t\t" + message.split(/\n/ig).slice(1).join("\n\t\t").dim);
    });