
var d3 = require('d3');
var topojson = require('topojson');
var _ = require('underscore');

window.Vec2 = require('Vec2');

var moment = require('moment');

var RefugeeMap = require('./refugee-map.js');
var RefugeeModel = require('./refugee-model.js');

// latitude = y
// longitude = x

console.time("load topomap")

d3.json('topomap.json', function(error, countries) {
	window.countries = countries;
	var fc = topojson.feature(countries, countries.objects.map);
	window.fc = fc;

	console.timeEnd("load topomap");

	console.time("init refugee model")
	var rmodel = new RefugeeModel(fc);
	console.timeEnd("init refugee model")

	console.time("init map")
	var rmap = new RefugeeMap(rmodel);
	console.timeEnd("init map")

	window.rmodel = rmodel;
	window.rmap = rmap;

	runAnimation();
});


var runAnimation = function() {
	rmodel.currentMoment = moment(new Date(2015, 3, 10));
	window.setInterval(function() {
		rmodel.currentMoment.add(1, 'hours');
		//console.log(rmodel.currentMoment.format());
		rmodel.updateActiveRefugees();
		rmap.drawRefugeePositions();

		d3.select('#time')
			.text(rmodel.currentMoment.format('DD.MM.YYYY  HH:mm:ss'));

	}, 25);
}
