
var d3 = require('d3');
var topojson = require('topojson');
var _ = require('underscore');

var moment = require('moment');

var RefugeeMap = require('./refugee-map.js');
var RefugeeModel = require('./refugee-model.js');

var Promise = require("bluebird");
Promise.promisifyAll(d3);

var queryString = require('query-string');

var START_TIME = new Date(2012, 0, 1);
var STEP_DURATION = new moment.duration(1, 'days');
var END_OF_DATA = new moment(new Date(2015, 8, 1));


// latitude = y
// longitude = x

console.time("load topomap")

var topomap;
var asylumData;
var regionalData;

var onceLoaded = function() {
	console.timeEnd("load json");

	var parsed = queryString.parse(location.search);
	var divider = parsed.divider != null ? parseInt(parsed.divider) : 25;

	var fc = topojson.feature(topomap, topomap.objects.map);
	window.fc = fc;

	console.time("init refugee model")
	var rmodel = new RefugeeModel(fc, asylumData, regionalData, divider);
	console.timeEnd("init refugee model")

	console.time("init map")
	var rmap = new RefugeeMap(rmodel);
	console.timeEnd("init map")

	window.rmodel = rmodel;
	window.rmap = rmap;

	rmodel.currentMoment = moment(START_TIME);

	runAnimation();

	//start();
	//startc();
	//run();
}


var load = function() {
	console.time("load json");
	var p1 = d3.jsonAsync('topomap.json').then(function(data) {
		topomap = data;
	});

	var p2 = d3.jsonAsync('asylum.json').then(function(data) {
		asylumData = data;
	}.bind(this));

	var p3 = d3.jsonAsync('regional-movements.json').then(function(data) {
		regionalData = data;
	}.bind(this));

	Promise.all([p1, p2, p3]).then(onceLoaded, function(error){
	    throw error;
	});
}


// runner option a
// ---------------

var count = 0;

var runAnimation = function() {
	console.time("50 frames");
	rmodel.currentMoment = moment(START_TIME);

	var intervalId = window.setInterval(function() {

		rmodel.currentMoment.add(STEP_DURATION);
		rmodel.updateActiveRefugees();

		rmap.drawRefugeePositions();
		rmap.drawRefugeeCounts();
		rmap.render();

		d3.select('#time')
			.text(rmodel.currentMoment.format('MMM YYYY'));

		count++;
		if (count == 50) {
			console.timeEnd("50 frames");
		}

		if (rmodel.currentMoment.isAfter(END_OF_DATA)) {
			clearInterval(intervalId);
		}
	}, 0);
}

// runner option b
// ---------------

var start = function() {
	var intervalId = window.setInterval(function() {
		rmodel.currentMoment.add(STEP_DURATION);
		rmodel.updateActiveRefugees();
		d3.select('#time')
			.text(rmodel.currentMoment.format('MMM YYYY'));
		if (rmodel.currentMoment.isAfter(END_OF_DATA)) {
			clearInterval(intervalId);
		}
	}, 25);
	animate();
}

var animate = function() {
	requestAnimationFrame(animate);
	rmap.drawRefugeePositions();
}


// runner option c
// ---------------

var startc = function() {
	animatec();
}

var animatec = function() {
	rmodel.currentMoment.add(STEP_DURATION);
	d3.select('#time')
		.text(rmodel.currentMoment.format('MMM YYYY'));
	rmodel.updateActiveRefugees();
	rmap.drawRefugeePositions();
	requestAnimationFrame(animatec);
}

// runner option d
// ---------------
//var run = function() {
// 	while (true) {
// 		rmodel.currentMoment.add(STEP_DURATION);
// 		d3.select('#time')
// 			.text(rmodel.currentMoment.format('DD.MM.YYYY  HH:mm:ss'));
// 		rmodel.updateActiveRefugees();
// 		rmap.drawRefugeePositions();
// 	}
// }
//





load();