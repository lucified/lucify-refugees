
var _ = require('underscore');
var utils = require('./utils.js');

var Refugee = require('./refugee.js');
var moment = require('moment');


var RefugeeModel = function(fc, asylumData) {
	this.fc = fc;
	this.asylumData = asylumData;
	this.refugees = [];
	this.activeRefugees = [];
	this.initialize();
};


RefugeeModel.prototype.initialize = function() {

	this.asylumData.forEach(function(item) {
		if (utils.getFeatureForCountry(this.fc, item.ac) == null) {
			console.log("country " + item.ac +  "not in map, skipping");
		
		} else if (utils.getFeatureForCountry(this.fc, item.oc) == null) {
			console.log("country " + item.oc +  "not in map, skipping");

		} else {
			this.addRefugees(item.oc, item.ac, item.count / 20, item.month - 1);
		}

	}.bind(this));

	//this.addRefugees("SYR", "FIN", 10, 4);
	//this.addRefugees("IRQ", "FIN", 10, 4);
	// //this.addRefugees("IRQ", "DEU", 50, 4);
	// this.addRefugees("IRQ", "DEU", 250, 4);
	// //this.addRefugees("IRQ", "DEU", 1382, 5);
	// //this.addRefugees("IRQ", "DEU", 1987, 6);
	// this.addRefugees("SYR", "DEU", 4810, 4);
	// //this.addRefugees("SYR", "DEU", 7301, 5);
	// //this.addRefugees("SYR", "DEU", 9136, 6);

	this.refugees.sort(function(a, b) {
		return a.getStartMoment().unix() - b.getStartMoment().unix();
	});
	this.refugeeIndex = 0;
}


RefugeeModel.prototype.updateActiveRefugees = function() {
	
	// filter out the ones that have arrived
	this.activeRefugees = this.activeRefugees.filter(function(r) {
		return r.arrived == false;
	});

	// add new ones
	do {
		var r = this.refugees[this.refugeeIndex];
		if (r != null && r.isPastStartMoment(this.currentMoment)) {
			this.activeRefugees.push(r);
			this.refugeeIndex++;	
		} else {
			return;	
		}
	} while (true);

}



RefugeeModel.prototype.addRefugees = function(startCountry, endCountry, count, month) {
	_.range(0, count).forEach(function() {
		this.refugees.push(this.createRefugee(startCountry, endCountry, month));
	}.bind(this));
}


RefugeeModel.prototype.kmhToDegsPerH = function(kmh) {
	return kmh / 111;
}




/*
 * Create a starting point
 * or endpoint within given country
 */
RefugeeModel.prototype.createCountryPoint = function(country) {
	var feature = utils.getFeatureForCountry(this.fc, country);
	if (feature == null) {
		throw "could not find feature for " + country;
	}
	return utils.getRandomPointForCountryBorderFeature(feature);
}


function daysInMonth(month,year) {
	return new Date(year, month, 0).getDate();
}


/*
 * Get a speed for a new refugee in km / h;
 */
RefugeeModel.prototype.prepareRefugeeSpeed = function() {
	return Math.random() * 2 + 4;
}



RefugeeModel.prototype.prepareRefugeeEndMoment = function(month) {
	var days = daysInMonth(month, 2015);
	var mom = moment(new Date(2015, month, 1));

	var maxSeconds = days * 24 * 60 * 60;
	var diff = Math.random() * maxSeconds;
	mom.add(diff, 'seconds');
	return mom;
}


RefugeeModel.prototype.createRefugee = function(startCountry, endCountry, month) {	
	var r = new Refugee(
		this.createCountryPoint(startCountry),
		this.createCountryPoint(endCountry),
		this.prepareRefugeeSpeed(),
		this.prepareRefugeeEndMoment(month)
	);
	return r;
}


module.exports = RefugeeModel;


// // kludge
// RefugeeModel.prototype.createSyrianPoint = function() {
// 	return utils.getRandomPoint(this.fc.features[1].geometry.coordinates[0]);
// }

// // kludge
// RefugeeModel.prototype.createFinnishPoint = function() {
// 	return utils.getRandomPoint(utils.getLargestPolygon(this.fc.features[0].geometry.coordinates));
// }