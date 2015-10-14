
var React = require('react');

// only used for testing, this will be disabled
// in production

var FrameRateLayer = React.createClass({


	componentWillMount: function() {
		this.smoothFps = 1;
	},


	render: function() {
		var diff = Date.now() - this.previousStamp;
		this.previousStamp = Date.now();
		
		var fps = 1000 / diff;

		if (isFinite(fps)) {
			var smoothing = 20;
			this.smoothFps = this.smoothFps 
				+ (fps - this.smoothFps) / smoothing;
		}
		
		return (
			<div className="frame-rate-layer" style={{padding: '1rem'}}>
				{this.smoothFps.toFixed(1)} fps
			</div>
		);
	}

});

module.exports = FrameRateLayer;