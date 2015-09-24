
var should = require('should');
var _ = require('underscore');
var moment = require('moment');
var utils = require('./utils.js');


var DATA_END_MOMENT = moment([2015, 8, 1]); // September 1
var DATA_START_YEAR = 2012;


/*
 * Provides an efficient stateless API for accessing 
 * counts of asylum seekers and refugees
 *
 * The main backing data structure is:
 *
 *   this.arrivedRefugeeCount[country][year][month]
 * 
 * With each item having the following fields:
 * 
 *   asylum.count                      count of asylum seekers during the month
 *   asylum.totalArrivedStartOfMonth   count of asylum seeksers who have arrived at start of month
 *   asylum.arrivingPerDay             asylum seekers arriving per day during the month
 *
 *   refugees.count
 *   refugees.totalArrivedStartOfMonth
 *   refugees.arrivingPerDay
 */

var RefugeeCountsModel = function(asylumData, regionalData) {
	should.notEqual(asylumData, null, "asylumData")
	should.notEqual(regionalData, null, "regionalData")

	this.destinationCountries = {};
	this.arrivedRefugeeCounts = {};
	
  // pair counts by destination
  this.pairCounts = {};

  // pair counts by origin
  this.pairCountsByOrigin = {};

	this._prepareCountsData(asylumData, regionalData);
}


//
// Internal functions for object construction
// ------------------------------------------
//

RefugeeCountsModel.prototype._prepareCountsData = function(asylumData, regionalData) {
	this._insertData(asylumData, true);
	this._insertData(regionalData, false);
	this._calculateMonthlyRefugeeSums();
}


RefugeeCountsModel.prototype._insertData = function(data, isAsylumSeeker) {
	data.forEach(function(item) {		
		this._addMonthlyArrivals(
			item.ac, 
			item.oc,
			item.year, 
			item.month, 
			item.count,
			isAsylumSeeker);
		this.destinationCountries[item.ac] = true;
	}.bind(this));
}


RefugeeCountsModel.prototype._addMonthlyArrivals = function(destinationCountry, originCountry, year, month, count, isAsylumSeeker) {
  var yearIndex = year - DATA_START_YEAR;
  var monthIndex = month - 1;

  if (year < DATA_START_YEAR) return;

  console.assert(monthIndex >= 0 && monthIndex < 12, "Month is between 0 and 11");
  console.assert(yearIndex >= 0 && yearIndex < 4, "Year is between 0 and 4");

  
  if (!this.arrivedRefugeeCounts[destinationCountry]) {
  	this.arrivedRefugeeCounts[destinationCountry] = this._prepareYearsMonthsArray();
  }

  this._ensurePairInitialized(this.pairCounts, destinationCountry, originCountry);
  this._ensurePairInitialized(this.pairCountsByOrigin, originCountry, destinationCountry);

  var fieldName = isAsylumSeeker ? 'asylum' : 'refugees';

  this.arrivedRefugeeCounts[destinationCountry][yearIndex][monthIndex][fieldName].count += count;
  this.pairCounts[destinationCountry][originCountry][yearIndex][monthIndex][fieldName].count += count;
  this.pairCountsByOrigin[originCountry][destinationCountry][yearIndex][monthIndex][fieldName].count += count;
};


RefugeeCountsModel.prototype._ensurePairInitialized = function(pc, dim1, dim2) {
  if (!pc[dim1]) {
    pc[dim1] = {};
  }
  if (!pc[dim1][dim2]) {
    pc[dim1][dim2] = this._prepareYearsMonthsArray();
  }
}


RefugeeCountsModel.prototype._prepareYearsMonthsArray = function() {
	var ret = new Array(4); // years, 2012-2015
    for (var y = 0; y < ret.length; y++) {
      ret[y] = new Array(12);
      for (var m = 0; m < ret[y].length; m++) {
        ret[y][m] = {
          asylum: {
            count: 0
          },
          refugees: {
            count: 0
          }
        };
      }
    }
    return ret;
}


RefugeeCountsModel.prototype._calculateMonthlyRefugeeSums = function () {
	this._enrichCountsArray(this.arrivedRefugeeCounts);

  var enrichPairCounts = function(pc) {
    _.keys(pc).forEach(function(key) {
      var arr = pc[key];
      this._enrichCountsArray(arr);
    }.bind(this));
  }.bind(this);

  enrichPairCounts(this.pairCounts);
  enrichPairCounts(this.pairCountsByOrigin);
}





// Adds the totalArrivedAtStartOfMonth and arrivingPerDay 
// properties to each item in the given array
RefugeeCountsModel.prototype._enrichCountsArray = function (arr) {
  for (var countryName in arr) {
    var country = arr[countryName];

    country[0][0].asylum.totalArrivedAtStartOfMonth = 0;
    country[0][0].asylum.arrivingPerDay = country[0][0].asylum.count / utils.daysInMonth(0, DATA_START_YEAR);
    country[0][0].refugees.totalArrivedAtStartOfMonth = 0;
    country[0][0].refugees.arrivingPerDay = country[0][0].refugees.count / utils.daysInMonth(0, DATA_START_YEAR);
    for (var year = 0; year < country.length; year++) {
      for (var month = 0; month < country[year].length; month++) {
        if (month === 0 && year === 0) continue;

        var previousMonth = month - 1;
        var previousMonthsYear = year;
        if (previousMonth < 0) {
          previousMonthsYear--;
          previousMonth = 11;
        }
        var daysInMonth = utils.daysInMonth(month, year + DATA_START_YEAR);

        country[year][month].asylum.totalArrivedAtStartOfMonth =
          country[previousMonthsYear][previousMonth].asylum.totalArrivedAtStartOfMonth +
          country[previousMonthsYear][previousMonth].asylum.count;
        country[year][month].refugees.totalArrivedAtStartOfMonth =
          country[previousMonthsYear][previousMonth].refugees.totalArrivedAtStartOfMonth +
          country[previousMonthsYear][previousMonth].refugees.count;
        country[year][month].asylum.arrivingPerDay = country[year][month].asylum.count / daysInMonth;
        country[year][month].refugees.arrivingPerDay = country[year][month].refugees.count / daysInMonth;
      }
    }
  }
};


// 
// Private functions
// -----------------
//

RefugeeCountsModel.prototype._prepareTotalCount = function(item, endStamp, debugInfo) {
  var mom = moment(new Date(endStamp * 1000));

  if (mom.isAfter(DATA_END_MOMENT)) {
    mom = DATA_END_MOMENT; // show last available data once we reach it
  } 

  var dayOfMonth = mom.date();
  var yearIndex = mom.year() - DATA_START_YEAR;
  var monthIndex = mom.month();
  var country = item;

  if (!country) {
    return { asylumApplications: 0, registeredRefugees: 0 };
  } else if (!country[yearIndex]) {
  	console.log("nothing found for year " + yearIndex + ", debugInfo: " + debugInfo + ", stamp " + endStamp);
	return { asylumApplications: 0, registeredRefugees: 0 };
  } else {
    return {
      asylumApplications: Math.round(country[yearIndex][monthIndex].asylum.totalArrivedAtStartOfMonth +
        dayOfMonth * country[yearIndex][monthIndex].asylum.arrivingPerDay),
      registeredRefugees: Math.round(country[yearIndex][monthIndex].refugees.totalArrivedAtStartOfMonth +
        dayOfMonth * country[yearIndex][monthIndex].refugees.arrivingPerDay)
    };
  }
};



//
// Public API
// ----------
//

RefugeeCountsModel.prototype.getTotalDestinationCounts = function(countryName, endStamp) {
  return this._prepareTotalCount(this.arrivedRefugeeCounts[countryName], endStamp, countryName);
};


RefugeeCountsModel.prototype.getOriginCountries = function(destinationCountry, endStamp) {
	var counts = this.getDestinationCountsByOriginCountries(destinationCountry, endStamp);
	return _.keys(counts).filter(function(country) {
		return counts[country].asylumApplications + counts[country].registeredRefugees > 0;
	});
}

/*
 * Get counts of asylum seekers and refugees who
 * have arrived at destinationCountry before endStamp
 *
 * Returned as a hash with the country code of each
 * origin country as key
 */
RefugeeCountsModel.prototype.getDestinationCountsByOriginCountries = function(destinationCountry, endStamp) {
  var ret = {};
  _.keys(this.pairCounts[destinationCountry]).forEach(function(originCountry){
  	ret[originCountry] = this._prepareTotalCount(
  		this.pairCounts[destinationCountry][originCountry], endStamp);
  }.bind(this));
  return ret;
};


RefugeeCountsModel.prototype.getOriginCountsByDestinationCountries = function(originCountry, endStamp) {
  var ret = {};
  _.keys(this.pairCountsByOrigin[originCountry]).forEach(function(destinationCountry){
    ret[destinationCountry] = this._prepareTotalCount(
      this.pairCountsByOrigin[originCountry][destinationCountry], endStamp);
  }.bind(this));
  return ret;
};



RefugeeCountsModel.prototype.getDestinationCountries = function() {
	return _.keys(this.destinationCountries);
}



module.exports = RefugeeCountsModel; 




