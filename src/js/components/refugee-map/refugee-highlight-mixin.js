
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
    //this.updateHighlight();
  },


  getHighlightedCountry: function() {
  	if (this.state.clickedCountry != null) {
  		return this.state.clickedCountry;
  	}
  	return this.state.hoveredCountry;
  },


  getDestinationCountries: function(country) {
    return this.props.refugeeCountsModel
      .getDestinationCountriesByStamp(country, this.props.stamp);
  },


  getOriginCountries: function(country) {
    return this.props.refugeeCountsModel
      .getOriginCountriesByStamp(country, this.props.stamp);
  },


  updateHighlight: function(country) {
      this.storedDestinationCountries = this.getDestinationCountries(country);
      this.storedOriginCountries = this.getOriginCountries(country);
      this.highlightStamp = this.props.stamp;
      this.country = this.props.country;
  },


  getHighlightLayerParams: function() {
  	if (this.highlightStamp !== this.props.stamp 
      || this.country !== this.getHighlightedCountry()) {
  		this.updateHighlight(this.getHighlightedCountry());
  	}
    return {
      country: this.getHighlightedCountry(),
      originCountries: this.storedOriginCountries,
      destinationCountries: this.storedDestinationCountries
    }
  },

}


module.exports = RefugeeHighlightMixin;