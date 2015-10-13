
// NOT IN USE

var React = require('react');
var d3 = require('d3');


var RefugeeMapControlsAndLegend = React.createClass({


	handleInputChange: function(value, value2) {		
		var node = React.findDOMNode(this.refs.speed);
		this.props.onSpeedChange(node.value);
	},


	handleStampChange: function() {		
		var node = React.findDOMNode(this.refs.stamp);
		
		if (this.props.onStampChange) {
			this.props.onStampChange(node.value);	
		}
	},


	render: function() {

		return (
			<div className="refugee-map-controls-and-legend">
	    		<div className="legend">
	      			<div><span className="dot">&middot;</span> <span id="people-per-point">25</span> people</div>
	      			<div><span className="asylum bar">&nbsp;</span>Total asylum applications</div>
	      			<div><span className="refugee bar">&nbsp;</span>Current registered refugees</div>
	    		</div>
	    
	    		<div className="speed">
	      			<label htmlFor="speed-control">Speed</label>
	      			<input type="range" 
	      				ref="speed"
	      				min="1" max="50" value={this.props.speed} 
	      				id="speed-control" step="1" 
	      				onChange={this.handleInputChange} />
	  			</div>

				<div className="stamp">
	      			<label htmlFor="speed-control">Time</label>
	      			<input type="range" 
	      				ref="stamp"
	      				min={this.props.minStamp} max={this.props.maxStamp} 
	      				value={this.props.stamp} 
	      				id="time-control" 
	      				onChange={this.handleStampChange} />
	  			</div>

			</div>
		);

	}

});


module.exports = RefugeeMapControlsAndLegend;