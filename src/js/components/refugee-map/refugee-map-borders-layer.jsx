
var React = require('react');
var d3 = require('d3');
var classNames = require('classnames');
var _ = require('underscore');
var sprintf = require('sprintf');
var console = require("console-browserify")



var getFullCount = function(counts) {
   if (!counts) {
      return 0;
   }
   return counts.asylumApplications;
}



var RefugeeMapBorder = React.createClass({


   componentDidMount: function() {
      this.sel = d3.select(React.findDOMNode(this.refs.overlay));
   },


   componentWillReceiveProps: function(nextProps, nextState) {
      this.sel
         .classed('subunit--hovered', nextProps.hovered)
         .classed('subunit--destination', nextProps.destination)
         .classed('subunit--origin', nextProps.origin);
   },


   shouldComponentUpdate: function(nextProps, nextState) {      
      // it is important to prevent an expensive diff of the svg path
      // a react render will only be needed if we need to resize
      return this.props.width !== nextProps.width;
   },


   updateWithCountDetails: function(details) {      
      var fillStyle = null;

      if (this.props.origin && getFullCount(details.originCounts) > 0) {
         fillStyle = sprintf('rgba(190, 88, 179, %.2f)', details.originScale(getFullCount(details.originCounts)));
      } else if (this.props.destination && getFullCount(details.destinationCounts) > 0) {
         fillStyle = sprintf('rgba(95, 196, 114, %.2f)', details.destinationScale(getFullCount(details.destinationCounts)));
      }
      
      this.sel.style('fill', fillStyle);
   },


   onMouseOver: function(){
      this.props.onMouseOver(this.props.country);
   },


   onMouseLeave: function(){
      this.props.onMouseLeave(this.props.country);
   },


   render: function() {
       
       // round pixels using a custom rendering context
       var d = "";
       var context = {
         beginPath: function() {
            d += ""
         },
         moveTo: function(x, y) {
            d += "M" + Math.round(x) + "," + Math.round(y)
         },
         lineTo: function(x, y) {
            d += "L" + Math.round(x) + "," + Math.round(y)
         },
         closePath: function() {
            d += "Z"
         },
         arc: function() {
            d += ""
         }
       }

       var path = this.props.path;
       path.context(context);

       path(this.props.feature);

       var country = this.props.country;
       
       //var d = path(this.props.feature);

       var overlay = this.props.enableOverlay ? (
         <path key="p2" ref="overlay"
               className="subunit--overlay"
               onMouseOver={this.onMouseOver}
               onMouseLeave={this.onMouseLeave} 
               d={d} />) : null;

       return (
         <g>
            <path key="p1"
               className={this.props.subunitClass}
               d={d} 
               onMouseOver={this.onMouseOver}
               onMouseLeave={this.onMouseLeave} />
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

   onMouseLeave: function(country) {
      //console.log("out of country" + country);
      if (this.props.onMouseLeave) {
         this.props.onMouseLeave(country);
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


   /*
    * Get count data for current
    * this.props.country at this.props.stamp
    */
   getCountData: function(stamp) {

      var getMaxCount = function(counts) {
         return _.values(counts).reduce(function(prev, item) {
            return Math.max(prev, item.asylumApplications);
         },0);
      }

      var countData = null;
      var exponent = 0.5;

      if (this.props.country != null) {
         var originCounts = this.props.refugeeCountsModel
            .getDestinationCountsByOriginCountries(this.props.country, stamp);
         var maxOriginCount = getMaxCount(originCounts);

         var destinationCounts = this.props.refugeeCountsModel
            .getOriginCountsByDestinationCountries(this.props.country, stamp);
         var maxDestinationCount = getMaxCount(destinationCounts);

         var originScale = d3.scale.pow().exponent(exponent).domain([0, maxOriginCount]).range([0.075, 0.80]);
         var destinationScale = d3.scale.pow().exponent(exponent).domain([1, maxDestinationCount]).range([0.075, 0.80]);

         //var originScale = d3.scale.linear().domain([0, maxOriginCount]).range([0.05, 0.80]);
         //var destinationScale = d3.scale.linear().domain([1, maxDestinationCount]).range([0.05, 0.80]);

         countData = {
            originCounts: originCounts,
            destinationCounts: destinationCounts,
            originScale: originScale,
            destinationScale: destinationScale
         }
      }  
      return countData;
   },


   /*
    * Get paths representing map borders
    */
   getPaths: function() {

      var countries = {};

      // while we use React to manage the DOM,
      // we still use D3 to calculate the path
      var path = d3.geo.path().projection(this.props.projection);

      return this.props.mapModel.featureData.features.map(function(feature) {
         var country = feature.properties.ADM0_A3;
         var hparams = this.getHighlightParams(country);

         if (countries[country]) {
            console.log("duplicate for " + country);
         }
         countries[country] = true;

         return <RefugeeMapBorder
            ref={country}
            enableOverlay={this.props.enableOverlay}
            subunitClass={this.props.subunitClass}
            key={country}
            onMouseLeave={this.onMouseLeave}
            onMouseOver={this.onMouseOver}
            path={path}
            feature={feature}
            country={country}
            width={this.props.width}
            {...hparams} />

      }.bind(this));
   },


   componentDidUpdate: function() {
      if (this.lastUpdate != null) {
         this.doUpdate(this.lastUpdate);
      }
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

      return false;
   },


   render: function() {
      //console.log("re-render borders " + this.props.country);
      return (
         <svg className="refugee-map-borders-layer" 
            style={{width: this.props.width, height: this.props.height}}
            onClick={this.onClick}>
            {this.getPaths()}
         </svg>
      )
   },


   // quick update
   // ------------

   updateForStamp: function(stamp) {
       if (!this.lastUpdate || Math.abs(this.lastUpdate - stamp) > 60 * 60 * 24 * 5) {
          this.doUpdate(stamp);
      }
   },


   doUpdate: function(stamp) {
     this.lastUpdate = stamp;
     var countData = this.getCountData(stamp);
     return this.props.mapModel.featureData.features.map(function(feature) {
         var country = feature.properties.ADM0_A3;
         var countDetails = {}; 
         if (countData != null) {
            countDetails = {
               originScale: countData.originScale,
               destinationScale: countData.destinationScale
            }
            countDetails.destinationCounts = countData.destinationCounts[country];
            countDetails.originCounts = countData.originCounts[country];
         }
         this.refs[country].updateWithCountDetails(countDetails);
      }.bind(this));
   }


});


module.exports = RefugeeMapBordersLayer;
