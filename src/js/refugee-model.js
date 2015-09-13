
var _ = require('underscore');
var utils = require('./utils.js');

var Refugee = require('./refugee.js');
var moment = require('moment');

window.SMART_SPREAD_ENABLED = true;

var RefugeeModel = function(fc, asylumData, regionalData, divider) {
	this.fc = fc;
	this.asylumData = asylumData;
	this.regionalData = regionalData;
	this.refugees = [];
	this.activeRefugees = [];
	this.divider = divider;
	this.refugeesOnPath = {};
	this.initialize();
};


RefugeeModel.prototype.initialize = function() {
	console.time("refugee adding");
	this.asylumData.forEach(this._addPeopleFromValidCountries.bind(this));
	console.timeEnd("refugee adding");
	console.time("regional adding");
	this.regionalData.forEach(this._addPeopleFromValidCountries.bind(this));
	console.timeEnd("regional adding");
	console.time("refugee sorting");
	this.refugees.sort(function(a, b) {
		return a.startMomentUnix - b.startMomentUnix;
	});
	console.timeEnd("refugee sorting");

	this.refugeeIndex = 0;
}

RefugeeModel.prototype._addPeopleFromValidCountries = function(item) {
	if (utils.getFeatureForCountry(this.fc, item.ac) == null) {
		console.log("asylum country " + item.ac +  "not in map, skipping");
	} else if (utils.getFeatureForCountry(this.fc, item.oc) == null) {
		console.log("origin country " + item.oc +  "not in map, skipping");
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

RefugeeModel.prototype._increaseRefugeeEnRoute = function(start, end) {
	if (!(start in this.refugeesOnPath)) {
		this.refugeesOnPath[start] = {};
	}
	if (!(end in this.refugeesOnPath[start])) {
		this.refugeesOnPath[start][end] = 1;
	} else {
		this.refugeesOnPath[start][end]++;
	}

	return this.refugeesOnPath[start][end];
}

RefugeeModel.prototype.updateActiveRefugees = function() {
	// filter out the ones that have arrived
	this.activeRefugees = this.activeRefugees.filter(function(r) {
		return r.arrived === false;
	});

	// add new ones
	do {
		var r = this.refugees[this.refugeeIndex];
		if (r != null && r.isPastStartMoment(this.currentMoment)) {
			if (window.SMART_SPREAD_ENABLED) {
				r.setRouteRefugeeCount(this._increaseRefugeeEnRoute(r.startPoint, r.endPoint));
			}
			this.activeRefugees.push(r);
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
 * Return the center point of the given country
 */
RefugeeModel.prototype.createCenterCountryPoint = function(country) {
	var feature = utils.getFeatureForCountry(this.fc, country);
	if (feature == null) {
		throw "could not find feature for " + country;
	}
	return utils.getCenterPointForCountryBorderFeature(feature);
}

/*
 * Create a random point within the given country
 */
RefugeeModel.prototype.createRandomCountryPoint = function(country) {
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
	return moment(new Date(year, month, 1).getTime() +
		Math.random() * daysInMonth(month, year) * 86400000); // ms in day
}


RefugeeModel.prototype.createRefugee = function(startCountry, endCountry, month, year) {
	var r = new Refugee(
		this.createCenterCountryPoint(startCountry),
		this.createCenterCountryPoint(endCountry),
		endCountry,
		this.prepareRefugeeSpeed(),
		this.prepareRefugeeEndMoment(month, year)
	);

	if (window.SMART_SPREAD_ENABLED) {
		r.onFinished.push(function() {
			this.refugeesOnPath[r.startPoint][r.endPoint]--;
		}.bind(this));
	}

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