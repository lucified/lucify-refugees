

var Refugee = require('./refugee.js');
var moment = require('moment');
var utils = require('./utils.js');

var createFullPointList = function(mapModel, asylumData, regionalData, peoplePerPoint) {
	return createPointList(mapModel, asylumData, peoplePerPoint, false)
		.concat(createPointList(mapModel, regionalData, peoplePerPoint, true));
}


var createPointList = function(mapModel, data, peoplePerPoint, isAsylumSeeker) {
  var ret = [];  
  data.forEach(function(item) {

  	if (!mapModel.containsCountry(item.ac)) {
      console.log("asylum country " + item.ac +  " not in map, skipping");
    } else if (!mapModel.containsCountry(item.oc)) {
      // console.log("origin country " + item.oc +  " not in map, skipping");
    } else {
      // add refugees for journey visualization
      var refugeesToAdd = Math.round(item.count / peoplePerPoint);
      for (var i = 0; i < refugeesToAdd; i++) {
        ret.push(createRefugee(mapModel, item.oc, item.ac,
          item.month - 1, item.year, isAsylumSeeker));
      }
    }
  });

  return ret;
}


/*
 * Get a speed for a new refugee in km / h;
 */
var prepareRefugeeSpeed = function() {
  return Math.random() * 2 + 4;
};


/*
 * Get an end moment for a random refugee that 
 * has arrived at given month (zero-based) and year
 */
var prepareRefugeeEndMoment = function(month, year) {
  return moment(new Date(year, month, 1).getTime() +
    Math.random() * utils.daysInMonth(month, year) * 86400000); // ms in day
};


/*
 * Create a refugee
 */
var createRefugee = function(mapModel, startCountry, endCountry, month, year, isAsylumSeeker) {
  var r = new Refugee(
    window.RANDOM_START_POINT ? mapModel.getRandomPointFromCountry(startCountry) : mapModel.getCenterPointOfCountry(startCountry),
    mapModel.getCenterPointOfCountry(endCountry),
    startCountry,
    endCountry,
    prepareRefugeeSpeed(),
    prepareRefugeeEndMoment(month, year),
    isAsylumSeeker
  );

  return r;
};


module.exports = createFullPointList;

