
var React = require('react');
var d3 = require('d3');
var _ = require('underscore');

var RefugeeMapCountryLabelsLayer = React.createClass({

  storedDestinationCountries: [],
  storedOriginCountries: [],


  getDestinationCountries: function() {
    var destinationCountries = this.props.refugeeModel.refugeesOnPath[this.props.highlightedCountry];
    if (destinationCountries) {
      return _.keys(_.pick(destinationCountries, function(count, country) { return count > 0; }));
    } else {
      return [];
    }
  },


  getOriginCountries: function() {
    return _.keys(_.pick(this.props.refugeeModel.refugeesOnPath,
      function(destinationCountries, originCountry) {
        return destinationCountries[this.props.highlightedCountry] &&
          destinationCountries[this.props.highlightedCountry] > 0;
      }.bind(this)));
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

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.highlightedCountry !== this.props.highlightedCountry) {
      this.storedDestinationCountries = [];
      this.storedOriginCountries = [];
    } else {
      this.storedDestinationCountries = _.union(this.storedDestinationCountries, this.getDestinationCountries());
      this.storedOriginCountries = _.union(this.storedOriginCountries, this.getOriginCountries());
    }
  },

/*
  shouldComponentUpdate: function(nextProps, nextState) {
  	return nextProps.highlightedCountry !== this.props.highlightedCountry;
  },
*/

  renderCountryLabels: function() {
  	var items = [];

  	items.push(this.renderCountryLabel(this.props.highlightedCountry, "highlighted"))

  	this.storedDestinationCountries.map(function(country) {
  		items.push(this.renderCountryLabel(country, "destination"));
  	}.bind(this));

	  this.storedOriginCountries.map(function(country) {
  		items.push(this.renderCountryLabel(country, "origin"));
  	}.bind(this));

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

