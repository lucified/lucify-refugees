
var React = require('react');
var d3 = require('d3');

// only used for testing, this will be disabled
// in production

var FrameRateLayer = React.createClass({


	componentWillMount: function() {
		this.smoothFps = 1;
	},


	componentDidMount: function() {
		this.sel = d3.select(React.findDOMNode(this.refs.fpsVal));
	},


	update: function() {
		var diff = Date.now() - this.previousStamp;
		this.previousStamp = Date.now();
		
		var fps = 1000 / diff;

		if (isFinite(fps)) {
			var smoothing = 20;
			this.smoothFps = this.smoothFps 
				+ (fps - this.smoothFps) / smoothing;
		}

		this.sel.text(this.smoothFps.toFixed(1));
	},


	render: function() {		
		return (
			<div className="frame-rate-layer" style={{padding: '1rem'}}>
				<span ref="fpsVal">?</span> fps
			</div>
		);
	}

});

module.exports = FrameRateLayer;