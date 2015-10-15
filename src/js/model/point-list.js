
var Refugee = require('./refugee.js');
var moment = require('moment');
var utils = require('../utils.js');


/*
 * Create list of refugees based on given asylum and regional data
 */
var createFullList = function(mapModel, asylumData, regionalData, 
  peoplePerPoint, randomStartPoint, smartSpreadEnabled) {

  return createList(asylumData, false).concat(createList(regionalData, true));
  
  function createList(data, isAsylumSeeker) {
    var ret = [];  

    if (!data) {
      return ret;
    }

    data.forEach(function(item) {
      if (!mapModel.containsCountry(item.ac)) {
        console.log("asylum country " + item.ac +  " not in map, skipping");
      } else if (!mapModel.containsCountry(item.oc)) {
        console.log("origin country " + item.oc +  " not in map, skipping");
      } else {
        // add refugees for journey visualization
        var refugeesToAdd = Math.round(item.count / peoplePerPoint);
        for (var i = 0; i < refugeesToAdd; i++) {
          ret.push(createRefugee(item.oc, item.ac,
            item.month - 1, item.year, isAsylumSeeker));
        }
      }
    });
    return ret;
  }

  /*
   * Create a refugee
   */
  function createRefugee(startCountry, endCountry, month, year, isAsylumSeeker) {
    var r = new Refugee(
      randomStartPoint ? mapModel.getRandomPointFromCountry(startCountry) : mapModel.getCenterPointOfCountry(startCountry),
      mapModel.getCenterPointOfCountry(endCountry),
      startCountry,
      endCountry,
      prepareRefugeeSpeed(),
      prepareRefugeeEndMoment(month, year),
      isAsylumSeeker,
      smartSpreadEnabled
    );
    return r;
  };
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



module.exports.createFullList = createFullList;

