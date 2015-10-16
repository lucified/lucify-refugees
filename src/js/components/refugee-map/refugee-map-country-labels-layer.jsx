
var React = require('react');
var d3 = require('d3');
var _ = require('underscore');

var refugeeConstants = require('../../model/refugee-constants.js');


var RefugeeMapCountryLabelsLayer = React.createClass({


 
  renderCountryLabel: function(country, type) {
    var point = this.props.projection(
      this.props.mapModel.getCenterPointOfCountry(country));

    return (
    <text key={country + type} x={point[0]} y={point[1] + 15} className={type}>
      {this.props.mapModel.getFriendlyNameForCountry(country)}
    </text>
    );
  },


  renderCountryLabels: function() {
  	var items = [];

    if (this.props.country === null) {
      return items;
    }

  	items.push(this.renderCountryLabel(this.props.country, "highlighted"))

    if (this.props.width > refugeeConstants.labelShowBreakPoint) {
      _.difference(this.props.destinationCountries, refugeeConstants.disableLabels) 
        .forEach(function(country) {
        items.push(this.renderCountryLabel(country, "destination"));
      }.bind(this));

      _.difference(this.props.originCountries, refugeeConstants.disableLabels) 
        .forEach(function(country) {
        items.push(this.renderCountryLabel(country, "origin"));
      }.bind(this));      
    }

    return items;
  },

  // refugee-map is updating the originCountries 
  // and destinationCountries in refugee-map's state
  // regularly when stamps are updated, so any changes
  // will trigger a render as appropriate
  shouldComponentUpdate: function(nextProps, nextState) {
      return nextProps.country !== this.props.country
        || nextProps.originCountries.length !== this.props.originCountries.length
        || nextProps.destinationCountries.length !== this.props.destinationCountries.length
        || nextProps.width !== this.props.width;
  },


  render: function() {
		return (
  		 <svg className="refugee-map-country-labels-layer"
  		    style={{width: this.props.width, height: this.props.height}}>
  		    {this.renderCountryLabels()}
  		 </svg>
		)
  }


});

module.exports = RefugeeMapCountryLabelsLayer;

