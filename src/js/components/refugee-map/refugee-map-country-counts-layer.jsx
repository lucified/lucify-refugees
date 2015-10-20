
var React = require('react');
var d3 = require('d3');
var _ = require('underscore');

var refugeeConstants = require('../../model/refugee-constants.js');


var RefugeeMapCountryCountsLayer = React.createClass({
  

    getInitialState: function() {
      return {state: null}
    },


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
          .getDestinationCountsByOriginCountries(this.props.country, this.state.stamp);

        var totalReceivedCount = 0;
        var totalLeftCount = 0;

        _.difference(this.props.originCountries, refugeeConstants.disableLabels)
          .forEach(function(country) {
          var cc = counts[country]
          if (cc != null) {
            var val = cc.asylumApplications;
            items.push(this.renderText(country, -val));
            totalReceivedCount += val;
          }
        }.bind(this));

       counts = this.props.refugeeCountsModel
          .getOriginCountsByDestinationCountries(this.props.country, this.state.stamp);
        
        _.difference(this.props.destinationCountries, refugeeConstants.disableLabels)
          .forEach(function(country) {
          var cc = counts[country]
          if (cc != null) {
            var val = cc.asylumApplications;
            items.push(this.renderText(country, cc.asylumApplications));
            totalLeftCount += val;
          }
        }.bind(this));
      }

      // On the hovered country we show either the amount of 
      // people received of the amount of people who have left
      //
      // Some countries both receive and generate asylum seekers
      // in most cases the other count is much larger, and 
      // each country is either mainly a receiver or originator
      // country.
      //
      // For such countries it is appropriate to simply know
      // whichever count is bigger
      //
      // Serbia is however a problem, as both numbers are similar
      // and the balance even shifts along the way
      // 
      
      var count = totalReceivedCount - totalLeftCount;

      // if (totalReceivedCount > totalLeftCount) {
      //   count = totalReceivedCount;
      // } else {
      //   count = -totalLeftCount;
      // }

      if (isFinite(count) && count != 0 && this.props.country !== "SRB") {
        items.push(this.renderText(this.props.country, count));
      }

      return items;
   },


   // by passing along the stamp to the state of this component,
   // we can trigger a re-render for specifically this component
   updateForStamp: function(stamp) {
      this.setState({stamp: stamp});
   },


   shouldComponentUpdate: function(nextProps, nextState) {
      if (nextProps.country !== this.props.country) {
          return true;
      }
      return !this.lastUpdated || Math.abs(this.lastUpdated - nextState.stamp) > 60 * 60 * 24 * 1;
   },


   render: function() {
        this.lastUpdated = this.state.stamp;
        return (
         <svg className="refugee-map-country-counts-layer"
            style={{width: this.props.width, height: this.props.height}}>
            {this.renderTexts()}
         </svg> 
        )
    }

});


module.exports = RefugeeMapCountryCountsLayer;
