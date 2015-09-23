
var React = require('react');
var d3 = require('d3');
var moment = require('moment');

var RefugeeMapTime = React.createClass({


	getFriendlyTime: function() {
		return moment(new Date(this.props.stamp * 1000)).format('DD.MM.YYYY');
	},

	render: function() {
		return (
			<div className="time"> 
				{this.getFriendlyTime()}
			</div>
		)
	}

});


module.exports = RefugeeMapTime;