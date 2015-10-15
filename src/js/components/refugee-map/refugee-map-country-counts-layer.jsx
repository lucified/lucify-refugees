
var React = require('react');
var d3 = require('d3');
var _ = require('underscore');

var refugeeConstants = require('../../model/refugee-constants.js');


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

      if (this.props.width > refugeeConstants.labelShowBreakPoint) {
        var counts = this.props.refugeeCountsModel
          .getDestinationCountsByOriginCountries(this.props.country, this.props.stamp);

        var totalReceivedCount = 0;
        var totalLeftCount = 0;

        _.difference(this.props.originCountries, refugeeConstants.disableLabels)
          .forEach(function(country) {
          var cc = counts[country]
          if (cc != null) { 
            var val = cc.asylumApplications + cc.registeredRefugees;
            items.push(this.renderText(country, val));
            totalReceivedCount += val;
          }
        }.bind(this));

       counts = this.props.refugeeCountsModel
          .getOriginCountsByDestinationCountries(this.props.country, this.props.stamp);
        
        _.difference(this.props.destinationCountries, refugeeConstants.disableLabels)
          .forEach(function(country) {
          var cc = counts[country]
          if (cc != null) {
            var val = cc.asylumApplications + cc.registeredRefugees;
            items.push(this.renderText(country, cc.asylumApplications + cc.registeredRefugees));
            totalLeftCount += val;
          }
        }.bind(this));
      }

      // on the hovered country we show either the amount of 
      // people received of the amount of people who have left
      //
      // in case there are both, we show nothing, as this would
      // is an ambiguous situation. this is a problem only for
      // a few countries
      var count = 0;
      if (totalReceivedCount > 0 && totalLeftCount == 0) {
        count = totalReceivedCount;
      } else if (totalLeftCount > 0 && totalReceivedCount == 0) {
        count = totalLeftCount;
      }

      if (count > 0) {
        items.push(this.renderText(this.props.country, count));
      }

      return items;
   },


   shouldComponentUpdate: function(nextProps) {
      if (nextProps.country !== this.props.country) {
          return true;
      }

      return Math.abs(this.lastUpdated - nextProps.stamp) > 60 * 60 * 24 * 2;
   },


   render: function() {
        this.lastUpdated = this.props.stamp;
        return (
         <svg className="refugee-map-country-counts-layer"
            style={{width: this.props.width, height: this.props.height}}>
            {this.renderTexts()}
         </svg> 
        )
    }

});


module.exports = RefugeeMapCountryCountsLayer;
