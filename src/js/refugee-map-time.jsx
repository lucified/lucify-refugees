
var React = require('react');
var d3 = require('d3');


var RefugeeMapTime = React.createClass({


	getFriendlyTime: function() {
		return this.props.currentMoment.format('DD.MM.YYYY');
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