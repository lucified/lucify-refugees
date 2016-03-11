
var moment = require('moment');

var Refugee = require('./refugee.js');
var RefugeeConstants = require('./refugee-constants.js');
var utils = require('../utils.js');


/*
 * Create list of refugees based on given asylum and regional data
 */
var createFullList = function(mapModel, asylumData, peoplePerPoint, randomStartPoint, smartSpreadEnabled) {
  var ret = [];

  var skippedCountries = {};
  var skippedFutureDataCountries = {};

  if (asylumData) {
    asylumData.forEach(function(item) {
      if (!mapModel.containsCountry(item.ac)) {
        skippedCountries[item.ac] = true;
      } else if (!mapModel.containsCountry(item.oc)) {
        skippedCountries[item.oc] = true;
      } else {
        if (item.year > RefugeeConstants.DATA_END_YEAR ||
            (item.year == RefugeeConstants.DATA_END_YEAR && (item.month - 1) > RefugeeConstants.DATA_END_MONTH)) {
          skippedFutureDataCountries[item.ac] = true;
        } else {
          // add refugees for journey visualization
          var refugeesToAdd = Math.round(item.count / peoplePerPoint);
          for (var i = 0; i < refugeesToAdd; i++) {
            ret.push(createRefugee(item.oc, item.ac, item.month - 1, item.year));
          }
        }
      }
    });

    if (Object.keys(skippedCountries).length > 0) {
      console.log('Skipped the following countries that are not on map: ' + // eslint-disable-line
        Object.keys(skippedCountries).join(', '));
    }
    if (Object.keys(skippedFutureDataCountries).length > 0) {
      console.log('Not showing data that is past ' + // eslint-disable-line
        RefugeeConstants.DATA_END_MOMENT.format('ll') +
        ' from the following countries: ' +
        Object.keys(skippedFutureDataCountries).join(', '));
    }
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
