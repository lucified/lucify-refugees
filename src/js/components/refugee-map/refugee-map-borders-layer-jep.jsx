
var React = require('react');
var d3 = require('d3');

var classNames = require('classnames');
var _ = require('underscore');
var sprintf = require('sprintf');

window.exponent = 0.5;


var RefugeeMapBorder = React.createClass({


   shouldComponentUpdate: function(nextProps, nextState) {
      this.update(nextProps);

      // we do the update inside the shouldComponentUpdate 
      // function to prevent an expensive diff of the svg path
      // a react render will only be needed if we need to resize
      return this.props.width !== nextProps.width;
   },


   update: function(nextProps) {
      this.sel
         .classed('subunit--hovered', nextProps.hovered)
         .classed('subunit--destination', nextProps.destination)
         .classed('subunit--origin', nextProps.origin);

      var count = nextProps.count != null ? nextProps.count.asylumApplications : 0;
      var fillStyle = null;

      if (nextProps.origin && count > 0) {
         fillStyle = sprintf('rgba(190, 88, 179, %.2f)', nextProps.originScale(count));
      } else if (nextProps.destination && count > 0){
         fillStyle = sprintf('rgba(95, 196, 114, %.2f)', nextProps.destinationScale(count));
      }

      this.sel.style('fill', fillStyle);
   },


   componentDidMount: function() {
      this.sel = d3.select(React.findDOMNode(this.refs.overlay));
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

       var overlay = this.props.enableOverlay ? (
         <path key="p2" ref="overlay"
               className="subunit--overlay"
               onMouseOver={this.onMouseOver}
               onMouseOut={this.onMouseOut} 
               d={d} />) : null;

       return (
         <g>
            <path key="p1"
               className={this.props.subunitClass}
               d={d} 
               onMouseOver={this.onMouseOver}
               onMouseOut={this.onMouseOut} />
            {overlay}
         </g>
      );

   }

});



var RefugeeMapBordersLayer = React.createClass({


   getDefaultProps: function() {
      return {
            subunitClass: 'subunit',
            updatesEnabled: true}
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
            return Math.max(prev, item.asylumApplications);
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
            ref={country}
            enableOverlay={this.props.enableOverlay}
            {...countDetails}
            subunitClass={this.props.subunitClass}
            key={country}
            onMouseOut={this.onMouseOut}
            onMouseOver={this.onMouseOver}
            path={path}
            feature={feature}
            country={country}
            width={this.props.width}
            {...hparams} />

      }.bind(this));
   },


   shouldComponentUpdate: function(nextProps, nextState) {
      if (this.props.width !== nextProps.width) {
         return true;
      }

      if (!this.props.updatesEnabled) {
         return false;
      }

      if (nextProps.country !== this.props.country) {
         return true;
      }

      if (nextProps.country != null 
         && (!this.lastUpdated 
            || Math.abs(this.lastUpdated - this.props.stamp) > 60 * 60 * 24 * 5)) {
         return true;
      }
      return false;
   },



   update: function() {
      this.props.mapModel.featureData.features.map(function() {
         
      });
   },


   render: function() {
      this.lastUpdated = this.props.stamp;
      console.log("borders re-render");
      return (
         <svg className="refugee-map-borders-layer" 
            style={{width: this.props.width, height: this.props.height}}
            onClick={this.onClick}>
            {this.getPaths()}
         </svg>
      )
   },


});


module.exports = RefugeeMapBordersLayer;
