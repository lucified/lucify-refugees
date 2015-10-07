
var _ = require('underscore');


var RefugeeHighlightMixin = {

  storedDestinationCountries: [],
  storedOriginCountries: [],
  highlightStamp: 0,


  getInitialState: function() {
  	return {
  		hoveredCountry: null,
  		clickedCountry: null
  	}
  },


  handleMapClick: function() {
  	this.setState({clickedCountry: this.state.hoveredCountry});
  },


  setHoveredCountry: function(country) {
    this.setState({hoveredCountry: country});
    this.updateHighlight();
  },


  getHighlightedCountry: function(country) {
  	if (this.state.clickedCountry != null) {
  		return this.state.clickedCountry;
  	}
  	return this.state.hoveredCountry;
  },


  getDestinationCountries: function() {
    var destinationCountries = this.props.refugeePointsModel
      .refugeesOnPath[this.getHighlightedCountry()];
    if (destinationCountries) {
      return _.keys(_.pick(destinationCountries, 
        function(count, country) { return count > 0; }));
    } else {
      return [];
    }
  },


  getOriginCountries: function() {
    return _.keys(_.pick(this.props.refugeePointsModel.refugeesOnPath,
      function(destinationCountries, originCountry) {
        return destinationCountries[this.getHighlightedCountry()] &&
          destinationCountries[this.getHighlightedCountry()] > 0;
      }.bind(this)));
  },


  updateHighlight: function() {
    if (this.previousCountry != this.getHighlightedCountry()
    	|| this.getHighlightedCountry() == null) {
      this.storedDestinationCountries = [];
      this.storedOriginCountries = [];
    } else {
      this.storedDestinationCountries = _.union(this.storedDestinationCountries, this.getDestinationCountries());
      this.storedOriginCountries = _.union(this.storedOriginCountries, this.getOriginCountries());
    }
    this.previousCountry = this.getHighlightedCountry();
  },


  getHighlightLayerParams: function() {
  	if (this.highlightStamp != this.props.stamp) {
  		this.highlightStamp = this.props.stamp;
  		this.updateHighlight();
  	}
    return {
      country: this.getHighlightedCountry(),
      originCountries: this.storedOriginCountries,
      destinationCountries: this.storedDestinationCountries
    }
  },

}



module.exports = RefugeeHighlightMixin;