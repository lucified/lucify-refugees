
var React = require('react');
var d3 = require('d3');
var _ = require('underscore');


var RefugeeMapCountryCountsLayer = React.createClass({
  

   renderText: function(country, count) {
      if (this.props.country === null) {
         return null;
      }

      var point = this.props.projection(
         this.props.mapModel.getCenterPointOfCountry(country));
      return (
         <text key={country} x={point[0]} y={point[1] + 30}>{count}</text>
      );
   },


   renderTexts: function() {
      var items = [];
      var totalCount = 0;

      var counts = this.props.refugeeCountsModel
        .getDestinationCountsByOriginCountries(this.props.country, this.props.stamp);

      this.props.originCountries.forEach(function(country) {
        var cc = counts[country]
        var val = cc.asylumApplications + cc.registeredRefugees;
        items.push(this.renderText(country, val));
        totalCount += val;
      }.bind(this));
      
      items.push(this.renderText(this.props.country, totalCount));
      return items;
   },


   render: function() {
        return (
         <svg className="refugee-map__country-counts-layer"
            style={{width: this.props.width, height: this.props.height}}>
            {this.renderTexts()}
         </svg> 
        )
    }

});


module.exports = RefugeeMapCountryCountsLayer;
