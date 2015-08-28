# HotFuzz

Fuzz your jade templates against a JSON schema to make sure they validate input
properly.

## Installation

`npm install -g hotfuzz`

## CLI Usage

### Example

`hotfuzz -f example/fixture.json -j example/template.jade`


### Full Usage

	Usage: index [options]
	
	Options:
	
	  -h, --help           output usage information
	  -V, --version        output the version number
	  -j --jade <path>     Specify a jade template to render
	  -f --fixture <path>  Specify a JSON fixture to pass to jade
	  
## API

```js
var fuzzer = require("hotfuzz");

fuzzer(fixture, template)
	.on("renderFailed", function(message){
		throw new Error(message);
	});
```

### Methods

##### `fuzz` (<object: `fixture`>, <function: `template`>)

Returns: EventEmitter

Repeatedly fuzzes the input fixture, replacing its leaves with various datatypes,
and then iteratively removing them — and running the template function each time
against it.

When it fails, it emits a `renderFailed` event.

The full list of events emitted are below.

### Events

*	`startingIteration` <number: `iteration`>
	Emitted when commencing a fuzzing iteration.
*	`transformingLeaves` <string: `fuzzerName`>
	Emitted with each fuzzer when transforming the leaf nodes in the object.
*	`testingRendering` <string: `fuzzerName`>
	Emitted with each fuzzer when attempting to render the template against the
	transformed fixture.
*	`testingRenderingOK` <string: `fuzzerName`>
	Emitted with each fuzzer when rendering the template against the fixture did
	not result in an error (TypeError and or otherwise.)
*	`renderFailed` <string: `errorMessage`>
	Emitted with an error message when rendering the template against the fixture
	resulted in an error.
*	`complete` array:[<string: `failureMessage`>...]
	Emitted once the fuzzing operation has concluded (the fixture has no remaining
	properties) with a list of error messages (if any) for all the template render
	failures captured over this time.

## Notes

* Tests inbound.

## Contributors

* Pierre Pointereau `<pypointereau@gmail.com>`

## Licence

Copyright (c) 2015, Christopher Giffard

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT,
OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.