var EventEmitter = require("events").EventEmitter;

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




function testRender(template, input, emitter) {
	try {
		template(input);
		return true;

	} catch(error) {
		emitter.emit("renderFailed", error.message);
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






function runFuzzingOperation(fixture, template, emitter){

	emitter =
		emitter && emitter instanceof EventEmitter ? emitter :
			new EventEmitter();

	var iteration = 0,
		failures  = 0;

	process.nextTick(function() {
		testRender(template, fixture, emitter);

		while (++iteration && Object.keys(fixture).length) {

			emitter.emit("startingIteration", iteration);

			Object.keys(transformations).forEach(function(fuzzerName) {
				emitter.emit("transformingLeaves", fuzzerName);

				iterate(fixture, transformations[fuzzerName]);

				emitter.emit("testingRendering", fuzzerName);

				if (!testRender(template, fixture, emitter)) {
					failures ++;
				} else {
					emitter.emit("testingRenderingOk", fuzzerName);
				}
			});
		}
		emitter.emit("complete", failures, iteration);
	});

	return emitter;
}


module.exports = runFuzzingOperation;
module.exports._iterate = iterate;
module.exports._isLeafNode = isLeafNode;
module.exports._testRender = testRender;
