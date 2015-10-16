
var moment = require('moment');
var _ = require('underscore');

var Refugee = require('./refugee.js');
var utils = require('../utils.js');


/*
 * Create list of refugees based on given asylum and regional data
 */
var createFullList = function(mapModel, asylumData, peoplePerPoint, randomStartPoint, smartSpreadEnabled) {
  var ret = [];

  var skipped = {};

  if (asylumData) {
    asylumData.forEach(function(item) {
      if (!mapModel.containsCountry(item.ac)) {
        skipped[item.ac] = true;
      } else if (!mapModel.containsCountry(item.oc)) {
        skipped[item.oc] = true;
      } else {
        // add refugees for journey visualization
        var refugeesToAdd = Math.round(item.count / peoplePerPoint);
        for (var i = 0; i < refugeesToAdd; i++) {
          ret.push(createRefugee(item.oc, item.ac, item.month - 1, item.year));
        }
      }
    });

    console.log("Skipped the following countries that were not on map: " 
        + _.keys(skipped).join(', '));
  }

  return ret;

  /*
   * Create a refugee
   */
  function createRefugee(startCountry, endCountry, month, year) {
    return new Refugee(
      randomStartPoint ? mapModel.getRandomPointFromCountry(startCountry) : mapModel.getCenterPointOfCountry(startCountry),
      mapModel.getCenterPointOfCountry(endCountry),
      startCountry,
      endCountry,
      prepareRefugeeSpeed(),
      prepareRefugeeEndMoment(month, year),
      smartSpreadEnabled
    );
  }
};


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
