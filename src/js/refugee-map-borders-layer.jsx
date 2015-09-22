
var React = require('react');
var d3 = require('d3');


var RefugeeMapBordersLayer = React.createClass({


	getDefaultProps: function() {
		return {subunitClass: 'subunit'}
	},

	componentDidMount: function() {
		this.drawBorders();
	},

  // 	drawBorders: function() {
		// this._drawBorders(this.svg, 'subunit');
		// var sel = this._drawBorders(this.overlaySvg, 'subunit-invisible');

		// if (this.props.onMouseOver) {
		// 	sel.on("mouseover", function(feature) {
		// 		this.props.onMouseOver(feature.properties.ADM0_A3);
		// 	}.bind(this));
		// }

		// if (this.props.onMouseOut) {
		// 	sel.on("mouseout", function(feature) {
		// 		this.props.onMouseOut(feature.properties.ADM0_A3);
		// 	}.bind(this));
		// }
  // 	},

	drawBorders: function() {
		var path = d3.geo.path().projection(this.props.projection);
		
		var sel = d3.select(this.getDOMNode()).selectAll('.' + this.props.subunitClass)
		  .data(this.props.mapModel.featureData.features)
		  .enter()
		    .append('path')
		    .classed(this.props.subunitClass, true)
		    .attr("d", path);

		if (this.props.onMouseOver) {
			sel.on("mouseover", function(feature) {
				this.props.onMouseOver(feature.properties.ADM0_A3);
			}.bind(this));
		}

		if (this.props.onMouseOut) {
			sel.on("mouseout", function(feature) {
				this.props.onMouseOut(feature.properties.ADM0_A3);
			}.bind(this));
		} 
		return sel;
	},


	render: function() {
		return <svg style={{width: this.props.width, height: this.props.height}}/>
	}

});


module.exports = RefugeeMapBordersLayer;
