
var React = require('react');
var d3 = require('d3');
var _ = require('underscore');

var RefugeeMapCountryLabelsLayer = React.createClass({


  getDestCountries: function() {
  	var ret = {};
  	this.props.refugeeModel.activeRefugees.forEach(function(refugee) {
  		if (refugee.originCountry == this.props.highlightedCountry) {
  			ret[refugee.destinationCountry] = true;
  		} 
  	}.bind(this));
  	return _.keys(ret);
  },


  getOriginCountries: function() {
  	var ret = {};
  	this.props.refugeeModel.activeRefugees.forEach(function(refugee) {
  		if (refugee.destinationCountry == this.props.highlightedCountry) {
  			ret[refugee.originCountry] = true;
  		} 
  	}.bind(this));
  	return _.keys(ret);
  	//return this.props.originCountries;
  },


  renderCountryLabel: function(country, type) {
  	var point = this.props.projection(
  		this.props.mapModel.getCenterPointOfCountry(country));

  	return (
		<text key={country + type} x={point[0]} y={point[1] + 15} className={type}>
			{this.props.mapModel.getFriendlyNameForCountry(country)}
		</text>
  	);
  },


  shouldComponentUpdate: function(nextProps, nextState) {
  	return nextProps.highlightedCountry !== this.props.highlightedCountry;
  },


  renderCountryLabels: function() {
  	var items = [];

  	items.push(this.renderCountryLabel(this.props.highlightedCountry, "highlighted"))

  	items.concat(this.getDestCountries().map(function(country) {
  		items.push(this.renderCountryLabel(country, "destination"));
  	}.bind(this)));

	items.concat(this.getOriginCountries().map(function(country) {
  		items.push(this.renderCountryLabel(country, "origin"));
  	}.bind(this)));

	return items;
  },


  render: function() {
		return (
		 <svg className="refugee-map__country-labels-layer"
		    style={{width: this.props.width, height: this.props.height}}>
		    {this.renderCountryLabels()}
		 </svg> 
		)
   }


});

module.exports = RefugeeMapCountryLabelsLayer;

