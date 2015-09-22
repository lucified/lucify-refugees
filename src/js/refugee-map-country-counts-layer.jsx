
var React = require('react');
var d3 = require('d3');


var RefugeeMapCountryCountsLayer = React.createClass({


   getDefaultProps: function() {
      return {highlightedCountry: null};
   },
  

   // updateCountryCountLabels: function() {
   //    if (this.tickCount % 5 != 0) {
   //       return;
   //    }

   //    if (this.countryCountSelection) {
   //       this.countryCountSelection.text(function(data) {
   //          var counts = this.props.refugeeModel.getCurrentRefugeeTotal(data.country);
   //          return counts.asylumApplications + counts.registeredRefugees;
   //        }.bind(this));
   //      }
   //  },

   // showCountryCount: function(country) {
   //    var svg = d3.select(this.getDOMNode());

   //    var point = this.props.projection(
   //       this.props.mapModel.getCenterPointOfCountry(country));
    
   //    this.countryCountSelection 
   //       = svg.selectAll('.country-count')
   //          .data([{country: country, point: point}]);

   //    this.countryCountSelection.enter().append('text')
   //       .classed("country-count", true)
   //       .attr("x", function(data) { return data.point[0]; })
   //       .attr("y", function(data) { return 30 + data.point[1]; });

   //    this.updateCountryCountLabels();
   // },


   //  hideCountryCount: function(country) {
   //      this.countryCountSelection.remove();
   //      this.countryCountSelection = null;
   //  },


   renderText: function() {
      if (this.props.highlightedCountry === null) {
         return null;
      }

      var point = this.props.projection(
         this.props.mapModel.getCenterPointOfCountry(this.props.highlightedCountry));
      var counts = this.props.refugeeModel.getCurrentRefugeeTotal(this.props.highlightedCountry);
      var val = counts.asylumApplications + counts.registeredRefugees;

      return (
         <text x={point[0]} y={point[1] + 30}>{val}</text>
      );
   },

   render: function() {
        return (
         <svg className="refugee-map__country-counts-layer"
            style={{width: this.props.width, height: this.props.height}}>
            {this.renderText()}
         </svg> 
        )
    }

});


module.exports = RefugeeMapCountryCountsLayer;
