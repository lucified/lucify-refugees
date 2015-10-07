

var React = require('react');
var C3Chart = require('lucify-commons/src/js/components/react-c3/c3-chart.jsx');

var refugeeConstants = require('../../model/refugee-constants.js');
var moment = require('moment');

var RefugeeMapLineChart = require('./refugee-map-line-chart.jsx');

var RefugeeMapTimeLayer = React.createClass({


	getFriendlyTime: function() {
		return moment(new Date(this.props.stamp * 1000)).format('DD.MM.YYYY');
	},


	render: function() {
		return (
			<div className='refugee-map-time-layer'>
				<div className="refugee-map-time-layer__line">
					<RefugeeMapLineChart {...this.props} />
				</div>
				<div className="refugee-map-time-layer__time">
					{this.getFriendlyTime()}
				</div>
			</div>
		);
	}

});

module.exports = RefugeeMapTimeLayer;