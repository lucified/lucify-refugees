
var React = require('react');
var d3 = require('d3');


var RefugeeMapCountBar = React.createClass({

  // for some reason Safari
  // slows down a lot when
  // updates are rendered with
  // React, so we use D3 instead

  update: function() {
      var barSizeDivider = 3000;
      var country = this.props.country;
      var refugeeCounts = this.props.refugeeCountsModel.getTotalDestinationCounts(country, this.props.stamp);     
      var asylumBarSize = refugeeCounts.asylumApplications / barSizeDivider;
      var refugeeBarSize = refugeeCounts.registeredRefugees / barSizeDivider;
      var coordinates = this.props.projection(this.props.mapModel.getCenterPointOfCountry(country));
      var bothBarsShown = (refugeeBarSize > 0 && asylumBarSize > 0);

      this.refugeeSel
          .attr('y', coordinates[1] - refugeeBarSize)
          .attr('height', refugeeBarSize)
          .style('display', refugeeBarSize > 0 ? 'inherit' : 'none');

      this.asylumSel
          .attr('y', coordinates[1] - refugeeBarSize)
          .attr('height', refugeeBarSize)
          .attr('x', coordinates[0] - (bothBarsShown ? 6 : 2))
          .style('display', asylumBarSize > 0 ? 'inherit' : 'none');
  },


  shouldComponentUpdate: function() {
      this.update();
      return false;
  },


  componentDidMount: function() {
    this.refugeeSel = d3.select(React.findDOMNode(this.refs.refugeeBar));
    this.asylumSel = d3.select(React.findDOMNode(this.refs.asylumBar));
    this.update();
  },


  render: function() {
      var country = this.props.country;
      var coordinates = this.props.projection(this.props.mapModel.getCenterPointOfCountry(country));
      var rects = [];

      rects.push(
        <rect
           ref="refugeeBar"
           key="refugee-bar"
           className="refugee-bar" 
           x={coordinates[0] + 1}
           width={5} 
           height={0}
           y={0} />);

     rects.push(
        <rect
           ref="asylumBar"
           key="asylum-bar"
           className="asylum-bar" 
           width={5} 
           x={0}
           height={0}
           y={0} />);

      return <g key={country}>{rects}</g>;
  },
});


var RefugeeMapCountBarsLayer = React.createClass({

  getBarItems: function() {
      var items = []; 
      var countries = this.props.refugeeCountsModel.getDestinationCountries();

      var props = {
        refugeeCountsModel: this.props.refugeeCountsModel,
        projection: this.props.projection,
        mapModel: this.props.mapModel,
        stamp: this.props.stamp
      }

      if (this.props.highlightedCountry != null) {
      
        if (countries.indexOf(this.props.highlightedCountry) != -1) {
          items.push(<RefugeeMapCountBar key={this.props.highlightedCountry} {...props} country={this.props.highlightedCountry} />)
        }
        
      } else {
        countries.forEach(function(country) {
           items.push(<RefugeeMapCountBar key={country} {...props} country={country} />);
        }.bind(this));
      }

      return items;
   },


   shouldComponentUpdate: function(nextProps) {
      // update for five day differences
      return Math.abs(this.lastUpdate - nextProps.stamp) > 60 * 60 * 24 * 5;
   },


   render: function() {
      this.lastUpdate = this.props.stamp;
      return (
         <svg className="refugee-map-count-bars-layer" 
             style={{width: this.props.width, height: this.props.height}}>
             {this.getBarItems()}
         </svg>
      );
   }

});


module.exports = RefugeeMapCountBarsLayer;
