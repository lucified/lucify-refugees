
var React = require('react');
var d3 = require('d3');


var RefugeeMapBordersLayer = React.createClass({


   getDefaultProps: function() {
      return {subunitClass: 'subunit'}
   },


   componentDidMount: function() {
  
   },


   onMouseOver: function(country) {
      //console.log("over country" + country);
      if (this.onMouseOver) {
         this.props.onMouseOver(country);
      }
   },

   onMouseOut: function(country) {
      //console.log("out of country" + country);
      if (this.onMouseOut) {
         this.props.onMouseOut(country);
      }
   },


   shouldComponentUpdate: function(nextProps, nextState) {
      return nextProps.highlightedCountry !== this.props.highlightedCountry;
   },


   getPaths: function() {
      // while we use React to manage the DOM,
      // we still use D3 to calculate the path
      var path = d3.geo.path().projection(this.props.projection);

      return this.props.mapModel.featureData.features.map(function(feature) {
         return <path 
            className={this.props.subunitClass}
            onMouseOver={this.onMouseOver.bind(this, feature.properties.ADM0_A3)}
            onMouseOut={this.onMouseOut.bind(this, feature.properties.ADM0_A3)} 
            d={path(feature)} />
      }.bind(this));
   },

   render: function() {
      return (
         <svg style={{width: this.props.width, height: this.props.height}}>
            {this.getPaths()}
         </svg>
      )
   }

});


module.exports = RefugeeMapBordersLayer;
