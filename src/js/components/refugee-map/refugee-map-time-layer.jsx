
var React = require('react');
var C3Chart = require('lucify-commons/src/js/components/react-c3/c3-chart.jsx');

var refugeeConstants = require('../../model/refugee-constants.js');
var moment = require('moment');

var RefugeeMapLineChart = require('./refugee-map-line-chart.jsx');

var RefugeeMapTimeLayer = React.createClass({


	getInitialState: function() {
		return {}		
	},


	updateForStamp: function(stamp) {
		this.setState({stamp: stamp});
	},


	render: function() {
		if (!this.props.refugeeCountsModel) {
			return <div />
		};

		return (
			<div className='refugee-map-time-layer'>
				<RefugeeMapLineChart {...this.props} stamp={this.state.stamp} />
			</div>
		);
	}

});

module.exports = RefugeeMapTimeLayer;