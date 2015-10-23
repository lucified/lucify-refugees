
var React = require('react');
var d3 = require('d3');


var RefugeeMapSimpleBordersLayer = React.createClass({


	componentDidMount: function() {
		this.draw();
	},


	draw: function() {
		var path = d3.geo.path().projection(this.props.projection);
		var context = this.getDOMNode().getContext("2d");
		path.context(context);
		this.props.mapModel.featureData.features.map(function(feature) {
			path(feature);
		});

		context.fillStyle="#1A202B";
		context.fill();
		context.strokeStyle="#18b7b7";
		context.stroke();
		this.pendingUpdate = false;
	},


	componentWillReceiveProps: function(nextProps) {
		if (this.props.width !== nextProps.width) {
			this.pendingUpdate = true;
		}
	},

	componentDidUpdate: function() {
		if (this.pendingUpdate) {
			this.draw();
		}
	},

	render: function() {
		return <canvas className="refugee-map-simple-borders-layer"
		width={this.props.width} height={this.props.height} />
	}

});


module.exports = RefugeeMapSimpleBordersLayer;