
var React = require('react');
var queryString = require('query-string');

var RefugeeMainContent = require('./components/refugee-main-content.jsx');

var parsed = queryString.parse(location.search);

// TODO: get rid of these global variables
window.RANDOM_START_POINT = (parsed.randomStartPoint == "true");
window.SMART_SPREAD_ENABLED = !window.RANDOM_START_POINT;

var UrlParamsDecorator = require('lucify-commons/src/js/decorators/url-params-decorator.jsx');
var Component = UrlParamsDecorator(RefugeeMainContent);


var init = function() {
    var startTime = (parsed.startDate != null) ? new Date(parsed.startDate) : new Date(2012, 0, 1);

    React.render(
      <Component
        startStamp={Math.round(startTime.getTime() / 1000)} />,
      document.getElementById('content')
  );
}

init();



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


