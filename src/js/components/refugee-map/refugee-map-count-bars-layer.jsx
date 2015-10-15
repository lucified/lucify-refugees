
var React = require('react');
var d3 = require('d3');
var moment = require('moment');


var RefugeeMapCountBar = React.createClass({

  // for some reason Safari
  // slows down a lot when these
  // updates are rendered with
  // React, so we use D3 instead

  update: function() {
      
      var country = this.props.country;
      var refugeeCounts = this.props.refugeeCountsModel.getTotalDestinationCounts(country, this.props.stamp);     
      var asylumBarSize = this.props.scale(refugeeCounts.asylumApplications)
      var refugeeBarSize = this.props.scale(refugeeCounts.registeredRefugees);
      var coordinates = this.props.projection(this.props.mapModel.getCenterPointOfCountry(country));
      var bothBarsShown = (refugeeBarSize > 0 && asylumBarSize > 0);

      this.refugeeSel
          .attr('y', coordinates[1] - refugeeBarSize)
          .attr('height', refugeeBarSize)
          .style('display', refugeeBarSize > 0 ? 'inherit' : 'none');

      this.asylumSel
          .attr('y', coordinates[1] - asylumBarSize)
          .attr('height', asylumBarSize)
          .attr('x', coordinates[0] - (bothBarsShown ? 6 : 2))
          .style('display', asylumBarSize > 0 ? 'inherit' : 'none');
  },


  shouldComponentUpdate: function(nextProps) {
      this.update();
      return this.props.height !== nextProps.height;
  },


  componentDidMount: function() {
    this.refugeeSel = d3.select(React.findDOMNode(this.refs.refugeeBar));
    this.asylumSel = d3.select(React.findDOMNode(this.refs.asylumBar));
    this.update();
  },


  componentDidUpdate: function() {
    this.update();
  },


  render: function() {
      var country = this.props.country;
      var coordinates = this.props.projection(
        this.props.mapModel.getCenterPointOfCountry(country));
      
      var rects = [];

      var width = Math.max(3, Math.round(5 * this.props.width / 1000));

      rects.push(
        <rect
           ref="refugeeBar"
           key="refugee-bar"
           className="refugee-bar" 
           x={coordinates[0] + 1}
           width={width} 
           height={0}
           y={0} />);

     rects.push(
        <rect
           ref="asylumBar"
           key="asylum-bar"
           className="asylum-bar" 
           width={width} 
           x={0}
           height={0}
           y={0} />);

      return <g key={country}>{rects}</g>;
  },
});



var RefugeeMapCountBarsLayer = React.createClass({


  getTotal: function() {
    if (!this._total) {
      var counts = this.props.refugeeCountsModel.getTotalDestinationCounts('DEU', moment().unix());
      this._total = counts.asylumApplications + counts.registeredRefugees;
    }
    return this._total;
  },


  getBarSizeScale: function() {
      // this scale work as long as germany is in the
      // lead and we use the current map projection+position
      return d3.scale.linear()
        .domain([0, this.getTotal()])
        .range([0, this.props.height * 0.2]);
  },


  getBarItems: function() {
      var items = []; 
      var countries = this.props.refugeeCountsModel.getDestinationCountries();
      var scale = this.getBarSizeScale();

      var props = {
        refugeeCountsModel: this.props.refugeeCountsModel,
        projection: this.props.projection,
        mapModel: this.props.mapModel,
        stamp: this.props.stamp,
        scale: this.getBarSizeScale(),
        width: this.props.width,
        height: this.props.height
      }

      if (this.props.highlightedCountry != null) {
      
        if (countries.indexOf(this.props.highlightedCountry) != -1) {
          items.push(<RefugeeMapCountBar key={this.props.highlightedCountry + "_"} {...props} country={this.props.highlightedCountry} />)
        }
        
      } else {
        countries.forEach(function(country) {
           items.push(<RefugeeMapCountBar key={country} {...props} country={country} />);
        }.bind(this));
      }

      return items;
   },


   shouldComponentUpdate: function(nextProps) {
      
      window.dja = this;
      if (this.props.highlightedCountry !== nextProps.highlightedCountry
        || this.props.width !== nextProps.width) {
        return true;
      }

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
