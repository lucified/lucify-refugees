
var _ = require('underscore');
var moment = require('moment');
var React = require('react');
var queryString = require('query-string');

var RefugeeMap = require('./refugee-map.js');
var bindToRefugeeMapContext = require('./bind-to-refugee-map-context.jsx');


var parsed = queryString.parse(location.search);
window.RANDOM_START_POINT = (parsed.randomStartPoint == "true");
window.SMART_SPREAD_ENABLED = !window.RANDOM_START_POINT;

var RefugeeMapWithContext = bindToRefugeeMapContext(RefugeeMap);


var init = function() {

    var includeRegionalData = parsed.includeRegionalData == "false" ? false : true;
    var hdResolution = (parsed.hd == "true");
    var autostart = parsed.autostart == "false" ? false : true;
    var peoplePerPoint = parsed.peoplePerPoint != null ? parseInt(parsed.peoplePerPoint, 10) : 25;
    var startTime = (parsed.startDate != null) ? new Date(parsed.startDate) : new Date(2012, 0, 1);

    React.render(
      <RefugeeMapWithContext
        includeRegionalData={includeRegionalData}
        peoplePerPoint={peoplePerPoint}
        startStamp={Math.round(startTime.getTime() / 1000)}
        autoStart={autostart} />,
      document.getElementById('content')
  );
}


// // for video rendering with phantom js
// // -----------------------------------

// var tick = function() {
//   refugeeModel.currentMoment.add(1, 'hours');
//   d3.select('#time')
//     .text(refugeeModel.currentMoment.format('DD.MM.YYYY'));
//   refugeeModel.update();
//   refugeeMap.update();
// };

// // only for testing
// var tick100 = function() {
//   _.range(0, 100).forEach(tick);
// };

// window.tick = tick;
// window.tick100 = tick100;


init();

