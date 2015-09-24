
var React = require('react');
var d3 = require('d3');

var classNames = require('classnames');


var RefugeeMapBorder = React.createClass({

   shouldComponentUpdate: function() {
      d3.select(this.getDOMNode())
         .classed('subunit--hovered', this.props.hovered)
         .classed('subunit--destination', this.props.destination)
         .classed('subunit--origin', this.props.origin);
      return false;
   },

   onMouseOver: function(){
      console.log("over counry" + this.props.country);
      this.props.onMouseOver(this.props.country);
   },

   onMouseOut: function(){
      this.props.onMouseOut(this.props.country);
   },

   render: function() {
       var path = this.props.path;
       var country = this.props.country;
       return <path 
            key={country}
            className={this.props.subunitClass}
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut} 
            d={path(this.props.feature)} />
   }

});



var RefugeeMapBordersLayer = React.createClass({


   getDefaultProps: function() {
      return {subunitClass: 'subunit'}
   },


   componentDidMount: function() {
  
   },


   onMouseOver: function(country) {
      //console.log("over country" + country);
      if (this.props.onMouseOver) {
         this.props.onMouseOver(country);
      }
   },

   onMouseOut: function(country) {
      //console.log("out of country" + country);
      if (this.props.onMouseOut) {
         this.props.onMouseOut(country);
      }
   },


   getHighlightParams: function(country) {
      if (!this.props.country) {
         return {};
      }

      return {
         hovered: this.props.country == country,
         destination: this.props.destinationCountries.indexOf(country) != -1,
         origin: this.props.originCountries.indexOf(country) != -1
      }
   },


   getPaths: function() {

      window.props = this.props;

      // while we use React to manage the DOM,
      // we still use D3 to calculate the path
      var path = d3.geo.path().projection(this.props.projection);
      return this.props.mapModel.featureData.features.map(function(feature) {
         var country = feature.properties.ADM0_A3;

         return <RefugeeMapBorder
            subunitClass={this.props.subunitClass}
            key={country}
            onMouseOut={this.onMouseOut}
            onMouseOver={this.onMouseOver}
            path={path}
            feature={feature}
            country={country}
            {...this.getHighlightParams(country)} />

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
