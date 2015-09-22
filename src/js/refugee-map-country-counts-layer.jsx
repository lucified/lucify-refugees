
var React = require('react');
var d3 = require('d3');


var RefugeeMapCountryCountsLayer = React.createClass({


   getDefaultProps: function() {
      return {highlightedCountry: null};
   },
  

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
