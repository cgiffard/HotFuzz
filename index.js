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
    manifest  = require("./package.json");

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
var template = jade.compileFile(path.join(process.cwd(), program.jade));

function testRender(input) {
    try {
        template(input);
        return true;

    } catch(error) {
        var message = error.message;

        console.error("\t\tFailed to render template: %s".red, message.split(/\n/)[0]);
        console.error("\t\t" + message.split(/\n/ig).slice(1).join("\n\t\t").red.dim);
        return false;
    }
}

function isLeafNode(property) {
    if (!(property instanceof Object))
        return true;

    if (property instanceof Array && !property.length)
        return true;

    if (property instanceof Object && !Object.keys(property).length)
        return true;

    return false;
}

function iterate(object, replacer) {
    Object.keys(object).forEach(function(key) {
        if (isLeafNode(object[key])) {
            replacer(object, key);
        } else {
            iterate(object[key], replacer);
        }
    });
}

var transformations = {
    "Number Replace": function(object, key) {
        object[key] = Math.random();
    },
    "String Replace": function(object, key) {
        object[key] = String.fromCharCode(Math.random() * 255 | 0);
    },
    "Null Replace": function(object, key) {
        object[key] = null;
    },
    "Empty Object Replace": function(object, key) {
        object[key] = {};
    },
    "Function Replacer": function(object, key) {
        object[key] = function() {};
    },
    "Leaf Node Deletion": function(object, key) {
        delete object[key];
    }
};

// ---------- Let the fuzzing commence!

console.log("Verifying basic render...".cyan.dim);
testRender(fixture);

var iteration = 0,
    failures  = 0;

while (Object.keys(fixture).length) {

    console.log("Fuzzing iteration %d...".cyan, ++iteration);

    Object.keys(transformations).forEach(function(fuzzerName) {
        console.log("\tRunning leaf node fuzzer '%s'...".cyan.dim, fuzzerName);
        iterate(fixture, transformations[fuzzerName]);

        if (!testRender(fixture)) {
            failures ++;
        } else {
            console.log("\t\t-> OK.".dim);
        }
    });
}

console.log("\nConcluded with %d failures.".cyan, failures);

if (failures) {
    console.error((
        "The template crashed at least once during fuzzing.\n" +
        "Consider adding additional type checks where errors occurred."
    ).red);
}

process.exit(failures);