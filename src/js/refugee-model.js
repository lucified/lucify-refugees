
var _ = require('underscore');
var utils = require('./utils.js');

var Refugee = require('./refugee.js');
var moment = require('moment');


var RefugeeModel = function(fc, asylumData, regionalData, divider) {
	this.fc = fc;
	this.asylumData = asylumData;
	this.regionalData = regionalData;
	this.refugees = [];
	this.activeRefugees = [];
	this.divider = divider;
	this.initialize();
};


RefugeeModel.prototype.initialize = function() {

	console.time("refugee adding");
	this.asylumData.forEach(this._addPeopleFromValidCountries.bind(this));
	this.regionalData.forEach(this._addPeopleFromValidCountries.bind(this));
	console.timeEnd("refugee adding");

	//this.addRefugees("SYR", "FIN", 10, 4);

	console.time("refugee sorting");
	this.refugees.sort(function(a, b) {
		return a.startMomentUnix - b.startMomentUnix;
	});
	console.timeEnd("refugee sorting");

	this.refugeeIndex = 0;
}

RefugeeModel.prototype._addPeopleFromValidCountries = function(item) {
	if (utils.getFeatureForCountry(this.fc, item.ac) == null) {
		// do not warn about asylum countries we are
		// not interested in displaying for now
		if (['USA', 'CAN', 'AUS', 'CHN', 'JPN', 'KOR', 'NZL'].indexOf(item.ac) == -1) {
			console.log("asylum country " + item.ac +  "not in map, skipping");
		}
	} else if (utils.getFeatureForCountry(this.fc, item.oc) == null) {
		if (['CHN'].indexOf(item.oc) == -1) {
			console.log("origin country " + item.oc +  "not in map, skipping");
		}
	} else if (item.count > 0) {
		this.addRefugees(item.oc, item.ac, item.count / this.divider, item.month - 1, item.year);
	}
}


// RefugeeModel.prototype.removeRefugee = function(r) {
// 	var index = this.activeRefugees.indexOf(r);
// 	if (index == -1) {
// 		console.log("failaa" + r);
// 	} else {
// 		this.activeRefugees.splice(index, 1);
// 	}
// }


RefugeeModel.prototype.updateActiveRefugees = function() {
	// filter out the ones that have arrived
	this.activeRefugees = this.activeRefugees.filter(function(r) {
		return r.arrived === false;
	});

	// add new ones
	do {
		var r = this.refugees[this.refugeeIndex];
		if (r != null && r.isPastStartMoment(this.currentMoment)) {
			this.activeRefugees.push(r);
			//r.onFinished.push(this.removeRefugee.bind(this));
			this.refugeeIndex++;
		} else {
			return;
		}
	} while (true);
}


RefugeeModel.prototype.addRefugees = function(startCountry, endCountry, count, month, year) {
	_.times(Math.round(count), function() { // should it be Math.floor?
		this.refugees.push(this.createRefugee(startCountry, endCountry, month, year));
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


RefugeeModel.prototype.prepareRefugeeEndMoment = function(month, year) {
	var days = daysInMonth(month, year);
	var mom = moment(new Date(year, month, 1));

	var maxSeconds = days * 24 * 60 * 60;
	var diff = Math.random() * maxSeconds;
	mom.add(diff, 'seconds');
	return mom;
}


RefugeeModel.prototype.createRefugee = function(startCountry, endCountry, month, year) {
	var r = new Refugee(
		this.createCountryPoint(startCountry),
		this.createCountryPoint(endCountry),
		this.prepareRefugeeSpeed(),
		this.prepareRefugeeEndMoment(month, year)
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