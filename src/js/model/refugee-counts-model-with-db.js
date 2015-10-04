
var ForerunnerDB = require('forerunnerdb');
var should = require('should');
var _ = require('underscore');
var moment = require('moment');
var utils = require('../utils.js');


/*
 * DB-backed refugee counts model
 * 
 * NOT IN USE as turned out to be slow
 * but maybe this can be reused for some
 * slower counts
 */

var RefugeeCountsModel = function(asylumData, regionalData) {

	should.notEqual(asylumData, null, "asylumData")
	should.notEqual(asylumData, null, "regionalData")

	var fdb = new ForerunnerDB();
	var db = fdb.db();
	this.collection = db.collection('counts');
	this.collection.ensureIndex({
		originCountry: 1,
		destinationCountry: 1
	});

	this.collection.ensureIndex({
		destinationCountry: 1
	});

	this.destinationCountries = {};
	this._prepareCountsData(asylumData, regionalData);
}


// only for object construction
RefugeeCountsModel.prototype._prepareCountsData = function(asylumData, regionalData) {
	this._insertData(asylumData, 'a');
	this._insertData(regionalData, 'r');
}


// only for object construction
RefugeeCountsModel.prototype._insertData = function(data, type) {
	data.forEach(function(item) {
		this.collection.insert({
			destinationCountry: item.ac,
			originCountry: item.oc,
			count: item.count,
			month: item.month,
			year: item.year,
			type: type
		});

		this.destinationCountries[item.ac] = true;
	}.bind(this));
}


RefugeeCountsModel.prototype.getDestinationCountries = function() {
	return _.keys(this.destinationCountries);
}


RefugeeCountsModel.prototype.getTotalDestinationCounts = function(country, endStamp) {
  
  var mom = moment(new Date(endStamp * 1000));
  var dayOfMonth = mom.date();
  var year = mom.year();
  var month = mom.month() + 1;
  var daysInMonth = utils.daysInMonth(month - 1, year);

  var items = this.collection.find({
  	destinationCountry: country,
  	year: {
  		'$lte': year,
  	},
  	month: {
  		'$lte': month
  	}
  });

  var ret = {
  	registeredRefugees: 0,
  	asylumApplications: 0
  };

  items.forEach(function(item) {
  	var increment;
  	if (item.year == year && item.month == month) {
  		increment = Math.round(item.count / dayOfMonth / daysInMonth); 
  	
  	} else {
  		increment = item.count;
  	}

  	if (item.type === 'r') {
  		ret.registeredRefugees += increment;
  	} else {
  		ret.asylumApplications += increment;
  	}
  });
  return ret;

}


RefugeeCountsModel.prototype.getTargetCounts = function(country, endStamp) {


}





module.exports = RefugeeCountsModel; 




