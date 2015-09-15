
var d3 = require('d3');
var topojson = require('topojson');
var _ = require('underscore');

var moment = require('moment');

var RefugeeMap = require('./refugee-map.js');
var RefugeeModel = require('./refugee-model.js');

var Promise = require("bluebird");
Promise.promisifyAll(d3);

var queryString = require('query-string');


var parsed = queryString.parse(location.search);

// how many seconds is one second in the browser
// compared to the real world
var SPEED_RATIO = 60 * 60 * 24 *
  ((parsed.daysPerSecond != null) ? parseInt(parsed.daysPerSecond, 10) : 5); // 5 days default

var START_TIME = (parsed.startDate != null) ? new Date(parsed.startDate) : new Date(2012, 0, 1);
var END_OF_DATA = new moment(new Date(2015, 8, 1));

var AUTOSTART = parsed.autostart == "false" ? false : true;

window.RANDOM_START_POINT = parsed.randomStartPoint == "true" ? true : false;
window.HD_RESOLUTION = parsed.hd == "true" ? true : false;



console.time("load topomap");

var topomap;
var asylumData;
var regionalData;
var labels;

var onceLoaded = function() {
	console.timeEnd("load json");

	var divider = parsed.divider != null ? parseInt(parsed.divider, 10) : 25;

	var fc = topojson.feature(topomap, topomap.objects.map);
	window.fc = fc;

	console.time("init refugee model");
	var rmodel = new RefugeeModel(fc, asylumData, regionalData, divider, labels);
	console.timeEnd("init refugee model");

	console.time("init map");
	var rmap = new RefugeeMap(rmodel);
	console.timeEnd("init map");

	window.rmodel = rmodel;
	window.rmap = rmap;

	rmodel.currentMoment = moment(START_TIME);

	//runAnimation();

	if (AUTOSTART) {
		start();	
	}
	
	//startc();
	//run();
};


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

	var p4 = d3.jsonAsync('labels.json').then(function(data) {
		labels = data;
		window.labels = labels;
	}.bind(this));

	Promise.all([p1, p2, p3, p4]).then(onceLoaded, function(error){
		throw error;
	});
};



// runner option b
// ---------------

var startMoment;

var start = function() {
	startMoment = moment();
	animate();
};

var animate = function() {
	var millis = startMoment.diff();
	var modelMillis = -millis * SPEED_RATIO;

	rmodel.currentMoment = moment(START_TIME).add(modelMillis);

	d3.select('#time')
		.text(rmodel.currentMoment.format('DD.MM.YYYY'));
	rmodel.update();
	//rmap.drawRefugeePositions();
	rmap.drawRefugeeCounts();
	rmap.render();

	if (!rmodel.currentMoment.isAfter(END_OF_DATA)) {
		requestAnimationFrame(animate);
	}
};


// for video rendering with phantom js
// -----------------------------------

var tick = function() {
	rmodel.currentMoment.add(1, 'hours');
	d3.select('#time')
		.text(rmodel.currentMoment.format('DD.MM.YYYY'));
	rmodel.update();
	//rmap.drawRefugeePositions();
	rmap.drawRefugeeCounts();
	rmap.render();
}

// only for testing
var tick100 = function() {
	_.range(0, 100).forEach(tick);
}

window.tick = tick;
window.tick100 = tick100;


// // runner option a
// // ---------------

// var count = 0;

// var runAnimation = function() {
// 	console.time("50 frames");
// 	rmodel.currentMoment = moment(START_TIME);

// 	var intervalId = window.setInterval(function() {

// 		rmodel.currentMoment.add(STEP_DURATION);
// 		rmodel.updateActiveRefugees();

// 		rmap.drawRefugeePositions();
// 		rmap.drawRefugeeCounts();
// 		rmap.render();

// 		d3.select('#time')
// 			.text(rmodel.currentMoment.format('MMM YYYY'));

// 		count++;
// 		if (count == 50) {
// 			console.timeEnd("50 frames");
// 		}

// 		if (rmodel.currentMoment.isAfter(END_OF_DATA)) {
// 			clearInterval(intervalId);
// 		}
// 	}, 0);
// }


load();