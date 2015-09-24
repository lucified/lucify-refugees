
var React = require('react');
var d3 = require('d3');


var RefugeeMapCountBarsLayer = React.createClass({


  renderBar: function(country) {
      var barSizeDivider = 3000;

      var refugeeCounts = this.props.refugeeCountsModel.getTotalDestinationCounts(country, this.props.stamp);     
      var asylumBarSize = refugeeCounts.asylumApplications / barSizeDivider;
      var refugeeBarSize = refugeeCounts.registeredRefugees / barSizeDivider;
      var coordinates = this.props.projection(mapModel.getCenterPointOfCountry(country));
      var bothBarsShown = (refugeeBarSize > 0 && asylumBarSize > 0);

      var rects = [];

      if (refugeeBarSize > 0) {
         rects.push(
            <rect
               key="refugee-bar"
               className="refugee-bar" 
               x={coordinates[0] + 1}
               y={coordinates[1] - refugeeBarSize}
               width={5} 
               height={refugeeBarSize} />
         )
      }

      if (asylumBarSize > 0) {
         rects.push(
            <rect
               key="asylum-bar"
               className="asylum-bar" 
               x={coordinates[0] - (bothBarsShown ? 6 : 2)}
               y={coordinates[1] - asylumBarSize}
               width={5} 
               height={asylumBarSize} />);
      }

      return <g key={country}>{rects}</g>;
  },


  getBarItems: function() {
      var items = [];
   
      var countries = this.props.refugeeCountsModel.getDestinationCountries();

      if (this.props.highlightedCountry != null) {
      
        if (countries.indexOf(this.props.highlightedCountry) != -1) {
          items.push(this.renderBar(this.props.highlightedCountry));
        }
        
      } else {
        countries.forEach(function(country) {
           items.push(this.renderBar(country));
        }.bind(this));
      }

      return items;
   },


   render: function() {
      return (
         <svg className="count-bars-layer" 
             style={{width: this.props.width, height: this.props.height}}>
             {this.getBarItems()}
         </svg>
      );
   }

});


module.exports = RefugeeMapCountBarsLayer;
