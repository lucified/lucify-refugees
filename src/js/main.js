var d3 = require('d3');
var topojson = require('topojson');
var _ = require('underscore');
var moment = require('moment');
var React = require('react');

var RefugeeMap = require('./refugee-map.js');
var RefugeeCountsModel = require('./refugee-counts-model.js');
var RefugeePointsModel = require('./refugee-points-model.js');
var createFullPointsList = require('./create-full-point-list.js');

var MapModel = require('./map-model.js');

var Promise = require("bluebird");
Promise.promisifyAll(d3);

var queryString = require('query-string');
var parsed = queryString.parse(location.search);

// how many seconds is one second in the browser
// compared to the real world
window.SPEED_RATIO = 60 * 60 * 24 *
  ((parsed.daysPerSecond != null) ? parseInt(parsed.daysPerSecond, 10) : 5); // 5 days default

var START_TIME = (parsed.startDate != null) ? new Date(parsed.startDate) : new Date(2012, 0, 1);
var END_OF_DATA = new moment(new Date(2015, 8, 1));

var AUTOSTART = parsed.autostart == "false" ? false : true;

window.RANDOM_START_POINT = (parsed.randomStartPoint == "true");
window.SMART_SPREAD_ENABLED = !window.RANDOM_START_POINT;
window.HD_RESOLUTION = (parsed.hd == "true");
window.TRAILS_ENABLED = true;

console.time("load topomap");

var topomap;
var asylumData;
var regionalData;
var labels;
var refugeePointsModel;
var refugeeCountsModel;
var refugeeMap;

var onceLoaded = function() {
  console.timeEnd("load json");

  var peoplePerPoint = parsed.peoplePerPoint != null ? parseInt(parsed.peoplePerPoint, 10) : 25;

  var features = topojson.feature(topomap, topomap.objects.map);

  console.time("init map model");
  var mapModel = new MapModel(features, labels);
  console.timeEnd("init map model");

  console.time("create points list");
  var pointsList = createFullPointsList(mapModel, asylumData, regionalData, peoplePerPoint);
  console.timeEnd("create points list");

  console.time("init refugee points model");
  refugeePointsModel = new RefugeePointsModel(pointsList);
  console.timeEnd("init refugee points model");

  refugeeCountsModel = new RefugeeCountsModel(asylumData, regionalData);

  window.refugeeCountsModel = refugeeCountsModel;
  window.refugeePointsModel = refugeePointsModel;
  window.mapModel = mapModel;

  d3.select('#people-per-point')
    .text(peoplePerPoint);
  
  React.render(
    <RefugeeMap 
      startStamp={Math.round(START_TIME.getTime() / 1000)}
      autoStart={AUTOSTART}
      refugeeCountsModel={refugeeCountsModel}
      refugeePointsModel={refugeePointsModel}
      mapModel={mapModel} />,
    document.getElementById('content')
  );

  //if (AUTOSTART) {
  //  start();
  //}
};


var load = function() {
  console.time("load json");
  var p1 = d3.jsonAsync('topomap.json').then(function(data) {
    topomap = data;
  });

  var p2 = d3.jsonAsync('asylum.json').then(function(data) {
    asylumData = data;
  }.bind(this));

  var p3 = d3.jsonAsync('regional-movements.json').then(function(data) {
    regionalData = data;
  }.bind(this));

  var p4 = d3.jsonAsync('labels.json').then(function(data) {
    labels = data;
    window.labels = labels;
  }.bind(this));

  Promise.all([p1, p2, p3, p4]).then(onceLoaded, function(error){
    throw error;
  });
};



// runner option b
// ---------------

var previousMoment;

var start = function() {
  previousMoment = moment();
  refugeeModel.currentMoment = moment(START_TIME);
  animate();
};


var animate = function() {
  var millis = -previousMoment.diff();
  var modelMillis = millis * window.SPEED_RATIO;

  //
  //if (!refugeeModel.currentMoment.isAfter(END_OF_DATA)) {
  //  refugeeModel.currentMoment.add(modelMillis);
  //  previousMoment.add(millis);
  //}

  //refugeeModel.update();
  //refugeeMap.update();

  requestAnimationFrame(animate);
};


// for video rendering with phantom js
// -----------------------------------

var tick = function() {
  refugeeModel.currentMoment.add(1, 'hours');
  d3.select('#time')
    .text(refugeeModel.currentMoment.format('DD.MM.YYYY'));
  refugeeModel.update();
  refugeeMap.update();

  //refugeeMap.drawRefugeePositions();
  //refugeeMap.drawRefugeeCounts();
  //refugeeMap.render();
};

// only for testing
var tick100 = function() {
  _.range(0, 100).forEach(tick);
};

window.tick = tick;
window.tick100 = tick100;



load();
