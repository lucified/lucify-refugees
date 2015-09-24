
var _ = require('underscore');


var RefugeeHighlightMixin = {

  storedDestinationCountries: [],
  storedOriginCountries: [],
  highlightStamp: 0,


  setHighlightedCountry: function(country) {
    this.setState({highlightedCountry: country});
    this.updateHighlight();
  },


  getHighlightedCountry: function(country) {
  	return this.state.highlightedCountry;
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


  updateHighlight: function(newCountry) {
    if (newCountry !== this.getHighlightedCountry()) {
      this.storedDestinationCountries = [];
      this.storedOriginCountries = [];
    } else {
      this.storedDestinationCountries = _.union(this.storedDestinationCountries, this.getDestinationCountries());
      this.storedOriginCountries = _.union(this.storedOriginCountries, this.getOriginCountries());
    }
  },


  getHighlightLayerParams: function() {
  	if (this.highlightStamp != this.state.stamp) {
  		this.highlightStamp = this.state.stamp;
  		this.updateHighlight(this.state.highlightedCountry);
  	}
    return {
      country: this.getHighlightedCountry(),
      originCountries: this.storedOriginCountries,
      destinationCountries: this.storedDestinationCountries
    }
  },

}



module.exports = RefugeeHighlightMixin;