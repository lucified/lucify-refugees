
var React = require('react');
var d3 = require('d3');


var RefugeeMapCountBarsLayer = React.createClass({


  renderBar: function(country) {
      var barSizeDivider = 3000;

      var refugeeCounts = this.props.refugeeModel.getCurrentRefugeeTotal(country);
      
      var asylumBarSize = refugeeCounts.asylumApplications / barSizeDivider;
      var refugeeBarSize = refugeeCounts.registeredRefugees / barSizeDivider;
      var coordinates = this.props.projection(mapModel.getCenterPointOfCountry(country));
      var bothBarsShown = (refugeeBarSize > 0 && asylumBarSize > 0);

      var rects = [];

      if (refugeeBarSize > 0) {
         rects.push(
            <rect
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
               className="asylum-bar" 
               x={coordinates[0] - (bothBarsShown ? 6 : 2)}
               y={coordinates[1] - asylumBarSize}
               width={5} 
               height={asylumBarSize} />);
      }

      return <g>{rects}</g>;
  },


  getBarItems: function() {
      var items = [];

      if (this.props.refugeeModel.currentMoment == null) {
         return items;
      }

      // kludge. should produce country list in a better way
      for (var country in this.props.refugeeModel.arrivedRefugeeCounts) {
         items.push(this.renderBar(country));
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
