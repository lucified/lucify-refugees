var _ = require('underscore');
var Refugee = require('./refugee.js');
var moment = require('moment');
var utils = require('./utils.js');

var DATA_START_YEAR = 2012;
var DATA_END_MOMENT = moment([2015, 8, 1]); // September 1

var RefugeeModel = function(mapModel, asylumData, regionalData, peoplePerPoint, labels) {
  this.mapModel = mapModel;
  this.labels = labels;
  this.refugees = [];
  this.activeRefugees = [];
  this.peoplePerPoint = peoplePerPoint;
  this.refugeesOnPath = {};
  this.arrivedRefugeeCounts = {};
  this.currentMoment = null;
  this.refugeeIndex = 0;

  this.onRefugeeStarted = null;
  this.onRefugeeUpdated = null;
  this.onRefugeeFinished = null;

  console.time("asylum adding");
  asylumData.forEach(this._addPeopleFromValidCountries(true).bind(this));
  console.timeEnd("asylum adding");
  console.time("refugee adding");
  regionalData.forEach(this._addPeopleFromValidCountries(false).bind(this));
  console.timeEnd("refugee adding");
  console.time("refugee sorting");
  this.refugees.sort(function(a, b) {
    return a.startMomentUnix - b.startMomentUnix;
  });
  console.timeEnd("refugee sorting");
  this._calculateMonthlyRefugeeSums();
};


RefugeeModel.prototype._addPeopleFromValidCountries = function(isAsylumSeeker) {
  return function(item) {
    if (!this.mapModel.containsCountry(item.ac)) {
      console.log("asylum country " + item.ac +  " not in map, skipping");
    } else if (!this.mapModel.containsCountry(item.oc)) {
      console.log("origin country " + item.oc +  " not in map, skipping");
    } else {
      // add refugees for journey visualization
      var refugeesToAdd = Math.round(item.count / this.peoplePerPoint);
      for (var i = 0; i < refugeesToAdd; i++) {
        this.refugees.push(this.createRefugee(item.oc, item.ac,
          item.month - 1, item.year, isAsylumSeeker));
      }

      // add accurate refugee counts for bars/numbers
      this._addMonthlyArrivals(item.ac, item.year, item.month, item.count, isAsylumSeeker);
    }
  };
};

// this.arrivedRefugeesCounts is a hash with the country as a key. Each country is a 2D array:
// country[year][month], with year and month 0-based. Year 0 is DATA_START_YEAR.
// country[year][month] contains an object with two properties: asylum and refugees. Both of these
// are objects that contain a property called count, i.e. how many people arrived in that country
// during that month. _calculateMonthlyRefugeeSums() adds two more properties to asylum and refugees:
// totalArrivedAtStartOfMonth and arrivingPerDay
RefugeeModel.prototype._addMonthlyArrivals = function(destinationCountry, year, month, count, isAsylumSeeker) {
  var yearIndex = year - DATA_START_YEAR;
  var monthIndex = month - 1;

  if (year < DATA_START_YEAR) return;

  console.assert(monthIndex >= 0 && monthIndex < 12, "Month is between 0 and 11");
  console.assert(yearIndex >= 0 && yearIndex < 4, "Year is between 0 and 4");

  if (!this.arrivedRefugeeCounts[destinationCountry]) {
    this.arrivedRefugeeCounts[destinationCountry] = new Array(4); // years, 2012-2015
    for (var y = 0; y < this.arrivedRefugeeCounts[destinationCountry].length; y++) {
      this.arrivedRefugeeCounts[destinationCountry][y] = new Array(12);
      for (var m = 0; m < this.arrivedRefugeeCounts[destinationCountry][y].length; m++) {
        this.arrivedRefugeeCounts[destinationCountry][y][m] = {
          asylum: {
            count: 0
          },
          refugees: {
            count: 0
          }
        };
      }
    }
  }

  if (isAsylumSeeker) {
    this.arrivedRefugeeCounts[destinationCountry][yearIndex][monthIndex].asylum.count += count;
  } else {
    this.arrivedRefugeeCounts[destinationCountry][yearIndex][monthIndex].refugees.count += count;
  }
};

// This function adds the totalArrivedAtStartOfMonth and arrivingPerDay properties to each asylum and
// refugees object for each month object.
RefugeeModel.prototype._calculateMonthlyRefugeeSums = function () {
  for (var countryName in this.arrivedRefugeeCounts) {
    var country = this.arrivedRefugeeCounts[countryName];
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

RefugeeModel.prototype.getCurrentRefugeeTotal = function(countryName) {
  var mom;
  if (this.currentMoment.isAfter(DATA_END_MOMENT)) {
    mom = DATA_END_MOMENT; // show last available data once we reach it
  } else {
    mom = this.currentMoment;
  }

  var dayOfMonth = mom.date();
  var yearIndex = mom.year() - DATA_START_YEAR;
  var monthIndex = mom.month();
  var country = this.arrivedRefugeeCounts[countryName][yearIndex][monthIndex];

  return {
    asylumApplications: Math.round(country.asylum.totalArrivedAtStartOfMonth + dayOfMonth * country.asylum.arrivingPerDay),
    registeredRefugees: Math.round(country.refugees.totalArrivedAtStartOfMonth + dayOfMonth * country.refugees.arrivingPerDay)
  };
};

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
};

RefugeeModel.prototype.update = function() {
  var r;

  // add new ones
  while ((r = this.refugees[this.refugeeIndex]) != null && r.isPastStartMoment(this.currentMoment)) {
    if (window.SMART_SPREAD_ENABLED) {
      r.setRouteRefugeeCount(this._increaseRefugeeEnRoute(r.startPoint, r.endPoint));
    }
    this.activeRefugees.push(r);
    this.refugeeIndex++;
    this.onRefugeeStarted(r);
  }

  // update current ones
  var stillActive = [];
  var length = this.activeRefugees.length;

  for (var i = 0; i < length; i++) {
    r = this.activeRefugees[i];
    r.update(this.currentMoment);

    if (r.arrived) {
      if (window.SMART_SPREAD_ENABLED) {
        this.refugeesOnPath[r.startPoint][r.endPoint]--;
      }
      this.onRefugeeFinished(r);
    } else {
      stillActive.push(r);
      this.onRefugeeUpdated(r);
    }
  }

  this.activeRefugees = stillActive;
};


/*
 * Get a speed for a new refugee in km / h;
 */
RefugeeModel.prototype.prepareRefugeeSpeed = function() {
  return Math.random() * 2 + 4;
};


RefugeeModel.prototype.prepareRefugeeEndMoment = function(month, year) {
  return moment(new Date(year, month, 1).getTime() +
    Math.random() * utils.daysInMonth(month, year) * 86400000); // ms in day
};

// note: month is 0-based
RefugeeModel.prototype.createRefugee = function(startCountry, endCountry, month, year, isAsylumSeeker) {
  var r = new Refugee(
    window.RANDOM_START_POINT ? this.mapModel.getRandomPointFromCountry(startCountry) : this.mapModel.getCenterPointOfCountry(startCountry),
    this.mapModel.getCenterPointOfCountry(endCountry),
    startCountry,
    endCountry,
    this.prepareRefugeeSpeed(),
    this.prepareRefugeeEndMoment(month, year),
    isAsylumSeeker
  );

  return r;
};


module.exports = RefugeeModel;
