
var _ = require('underscore');
var MapModel = require('./map-model.js');

var React = require('react');
var BordersLayer = require('./refugee-map-borders-layer.jsx');
var CountryCountsLayer = require('./refugee-map-country-counts-layer.jsx');
var CountryLabelsLayer = require('./refugee-map-country-labels-layer.jsx');
var CountBarsLayer = require('./refugee-map-count-bars-layer.jsx');
var RefugeeMapPointsLayer = require('./refugee-map-points-layer.jsx')


var RefugeeMap = React.createClass({


  //if (window.HD_RESOLUTION) {
  //  this.getWidth() = 1920;
  //  this.height = 1080;
  //}


  getInitialState: function() {
    return {
        highlightedCountry: null,
        time: 0};
  },


  getDefaultProps: function() {
    return {
      width: 1200,
      height: 1200
    }
  },
   

  componentDidMount: function() {
    this.props.refugeeModel.onModelUpdated = this.update;
  },


  update: function() {
    // this will trigger updates for child components
    // (unless blocked by shouldComponentUpdate)
    this.setState({time: this.props.refugeeModel.currentMoment.unix()});
  },


  getWidth: function() {
    return this.props.width;
  },


  getHeight: function() {
    return this.props.height;
  },


  handleMouseOver: function(country) {
    this.setState({highlightedCountry: country});
  },


  handleMouseOut: function(country) {
    //if (this.state.highlightedCountry == country) {
    //  this.setState({highlightedCountry: null});
    //}
  },

 
  getProjection: function() {
    if (!this._projection){

      var lo = 26.2206322; // x
      var la = 46.0485818; // y

      this._projection = d3.geo.mercator()
        .center([0, la])
        .rotate([-lo, 0])
        .scale(this.getWidth()*0.55)
        .translate([this.getWidth() / 2, this.getHeight() / 2])
    }
    return this._projection;
  },


  getStandardLayerParams: function() {
    return {
      mapModel: this.props.mapModel,
      refugeeModel: this.props.refugeeModel,
      projection: this.getProjection(),
      width: this.getWidth(),
      height: this.getHeight(),
    }
  },


  render: function() {
    return (
      <div className="refugee-map">
        
        <BordersLayer 
          {...this.getStandardLayerParams()}
          subunitClass="subunit" />

        <CountryCountsLayer
          {...this.getStandardLayerParams()}
          highlightedCountry={this.state.highlightedCountry} />

        <CountryLabelsLayer
          {...this.getStandardLayerParams()}
          highlightedCountry={this.state.highlightedCountry} />

        <CountBarsLayer
          {...this.getStandardLayerParams()} />

        <RefugeeMapPointsLayer
          {...this.getStandardLayerParams()} />
        
        <BordersLayer
          {...this.getStandardLayerParams()}
          subunitClass="subunit-invisible"
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut} />
      
      </div>
    )
  }


});



module.exports = RefugeeMap;
