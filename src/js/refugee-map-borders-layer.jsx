
var React = require('react');
var d3 = require('d3');

var classNames = require('classnames');
var _ = require('underscore');
var sprintf = require('sprintf');

window.exponent = 0.5;

var RefugeeMapBorder = React.createClass({


   shouldComponentUpdate: function() {
      var sel = d3.select(React.findDOMNode(this.refs.overlay));

      sel
         .classed('subunit--hovered', this.props.hovered)
         .classed('subunit--destination', this.props.destination)
         .classed('subunit--origin', this.props.origin);
      
      var count = this.props.count != null ? this.props.count.asylumApplications + this.props.count.registeredRefugees : 0;
      
      var fillStyle = null;

      if (this.props.origin && count > 0) {
         fillStyle = sprintf('rgba(190, 88, 179, %.2f)', this.props.originScale(count));
      } else if (this.props.destination && count > 0){
         fillStyle = sprintf('rgba(95, 196, 114, %.2f)', this.props.destinationScale(count));
      }

      sel.style('fill', fillStyle);

      return false;
   },


   onMouseOver: function(){
      this.props.onMouseOver(this.props.country);
   },


   onMouseOut: function(){
      this.props.onMouseOut(this.props.country);
   },


   render: function() {
       var path = this.props.path;
       var country = this.props.country;

       var d = path(this.props.feature);

       return (
         <g>
            <path key="p1"
               className={this.props.subunitClass}
               d={d} />
            <path key="p2" ref="overlay"
               className="subunit--overlay"
               onMouseOver={this.onMouseOver}
               onMouseOut={this.onMouseOut} 
               d={d} />
         </g>
      );

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

   onClick: function() {
      if (this.props.onClick) {
         this.props.onClick();
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


   getCountData: function() {

      var getMaxCount = function(counts) {
         return _.values(counts).reduce(function(prev, item) {
            return Math.max(prev, item.asylumApplications + item.registeredRefugees);
         },0);
      }

      var countData = null;

      if (this.props.country != null) {
         var originCounts = this.props.refugeeCountsModel
            .getDestinationCountsByOriginCountries(this.props.country, this.props.stamp);
         var maxOriginCount = getMaxCount(originCounts);

         var destinationCounts = this.props.refugeeCountsModel
            .getOriginCountsByDestinationCountries(this.props.country, this.props.stamp);
         var maxDestinationCount = getMaxCount(destinationCounts);


         var originScale = d3.scale.pow().exponent(window.exponent).domain([0, maxOriginCount]).range([0.05, 0.80]);
         var destinationScale = d3.scale.pow().exponent(window.exponent).domain([1, maxDestinationCount]).range([0.05, 0.80]);
               
         countData = {
            originCounts: originCounts,
            destinationCounts: destinationCounts,
            originScale: originScale,
            destinationScale: destinationScale
         }
      }  
      return countData;
   },


   getPaths: function() {

      window.props = this.props;

      var countData = this.getCountData();

      // while we use React to manage the DOM,
      // we still use D3 to calculate the path
      var path = d3.geo.path().projection(this.props.projection);
      return this.props.mapModel.featureData.features.map(function(feature) {
         var country = feature.properties.ADM0_A3;

         var hparams = this.getHighlightParams(country);

         var countDetails = {}; 
         if (countData != null) {
            countDetails = {
               originScale: countData.originScale,
               destinationScale: countData.destinationScale
            }
            if (hparams.destination) {
               countDetails.count = countData.destinationCounts[country];
            }
            if (hparams.origin) {
               countDetails.count = countData.originCounts[country];
            }
         }

         return <RefugeeMapBorder
            {...countDetails}
            subunitClass={this.props.subunitClass}
            key={country}
            onMouseOut={this.onMouseOut}
            onMouseOver={this.onMouseOver}
            path={path}
            feature={feature}
            country={country}
            {...hparams} />

      }.bind(this));
   },

   render: function() {
      return (
         <svg style={{width: this.props.width, height: this.props.height}}
            onClick={this.onClick}>
            {this.getPaths()}
         </svg>
      )
   }

});


module.exports = RefugeeMapBordersLayer;
