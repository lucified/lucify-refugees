
var _ = require('underscore');
var MapModel = require('./map-model.js');

var React = require('react');
var BordersLayer = require('./refugee-map-borders-layer.jsx');
var CountryCountsLayer = require('./refugee-map-country-counts-layer.jsx');
var CountryLabelsLayer = require('./refugee-map-country-labels-layer.jsx');
var CountBarsLayer = require('./refugee-map-count-bars-layer.jsx');
var PointsLayer = require('./refugee-map-points-layer.jsx')

var ControlsAndLegend = require('./refugee-map-controls-and-legend.jsx');
var Time = require('./refugee-map-time.jsx');

var RefugeeMap = React.createClass({


  //if (window.HD_RESOLUTION) {
  //  this.getWidth() = 1920;
  //  this.height = 1080;
  //}


  getInitialState: function() {
    return {
        highlightedCountry: null,
        stamp: this.props.startStamp, // unix timestamps (seconds-precision)
        speed: 5};
  },


  getDefaultProps: function() {
    return {
      width: 1200,
      height: 1200
    }
  },
   
  componentWillMount: function() {

  },


  componentDidMount: function() {
    //this.props.refugeeModel.onModelUpdated = this.update;
    this.play();
  },


  play: function() {
      var newStamp = this.state.stamp + 60 * 60 * this.state.speed;
      this.setState({stamp: newStamp});
      requestAnimationFrame(this.play);
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
    var hl = country == "RUS" ? null : country;
    this.setState({highlightedCountry: hl});
  },


  handleMouseOut: function(country) {
    if (this.state.highlightedCountry == country) {
      this.setState({highlightedCountry: null});
    }
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
      projection: this.getProjection(),
      width: this.getWidth(),
      height: this.getHeight(),
      stamp: this.state.stamp,
    }
  },


  handleSpeedChange: function(newSpeed) {
    window.TRAILS_ENABLED = (newSpeed <= 12);
    window.SPEED_RATIO = 60 * 60 * 24 * newSpeed;
    this.setState({speed: newSpeed});
  },


  render: function() {
    return (
      <div className="refugee-map"
        style={{width: this.getWidth(), height: this.getHeight()}}>
        
        <BordersLayer 
          {...this.getStandardLayerParams()}
          subunitClass="subunit" />

        <CountryLabelsLayer
          {...this.getStandardLayerParams()}
          refugeeCountsModel={this.props.refugeeCountsModel} 
          refugeePointsModel={this.props.refugeePointsModel} 
          highlightedCountry={this.state.highlightedCountry} />

        <CountryCountsLayer
          {...this.getStandardLayerParams()}
          highlightedCountry={this.state.highlightedCountry}
          refugeeCountsModel={this.props.refugeeCountsModel}  />

        <CountBarsLayer
          {...this.getStandardLayerParams()}
          refugeeCountsModel={this.props.refugeeCountsModel} />

        <PointsLayer
          {...this.getStandardLayerParams()}
          highlightedCountry={this.state.highlightedCountry}
          refugeePointsModel={this.props.refugeePointsModel} />

        <BordersLayer
          {...this.getStandardLayerParams()}
          subunitClass="subunit-invisible"
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut} />
        
        <ControlsAndLegend
          speed={this.state.speed}
          onSpeedChange={this.handleSpeedChange} />

      </div>
    )
  }
});



module.exports = RefugeeMap;


