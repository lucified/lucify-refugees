
var _ = require('underscore');

//var MapModel = require('./map-model.js');

var React = require('react');
var BordersLayer = require('./refugee-map-borders-layer.jsx');
var CountryCountsLayer = require('./refugee-map-country-counts-layer.jsx');
var CountryLabelsLayer = require('./refugee-map-country-labels-layer.jsx');
var CountBarsLayer = require('./refugee-map-count-bars-layer.jsx');
var PointsLayer = require('./refugee-map-points-layer.jsx')
var RefugeeMapLineChart = require('./refugee-map-line-chart.jsx');

var ControlsAndLegend = require('./refugee-map-controls-and-legend.jsx');
var TimeLayer = require('./refugee-map-time-layer.jsx');

var constants = require('../../model/refugee-constants.js');

var RefugeeHighlightMixin = require('./refugee-highlight-mixin.js');



var RefugeeMap = React.createClass({


  //if (window.HD_RESOLUTION) {
  //  this.getWidth() = 1920;
  //  this.height = 1080;
  //}


  mixins: [RefugeeHighlightMixin],



  getInitialState: function() {
    return {
        stamp: this.props.startStamp, // unix timestamps (seconds-precision)
        speed: 3,
        play: this.props.autoStart,
    }
  },


  getDefaultProps: function() {
    return {
      width: 1200,
      height: 1200,
      autoStart: true
    }
  },
   
  componentWillMount: function() {

  },


  componentDidMount: function() {
    window.rmap = this;
    this.blockPlay = false;

    this.scheduleUnblockPlay = _.debounce(function() {
        //console.log("unblocking play");
        this.unblockPlay();
    }, 500);

    if (this.props.autoStart) {
      this.play();
    }
  },


  unblockPlay: function() {
    this.blockPlay = false;
    this.play();
  },


  play: function() {
      if (this.state.stamp < constants.DATA_END_MOMENT.unix()) {
        if (!this.blockPlay && this.state.play) {
          var increment = (60 * 60 * this.state.speed);
          var newStamp = this.state.stamp + increment;
          this.setState({stamp: newStamp});  
          requestAnimationFrame(this.play);    
        }
      }
  },


  getWidth: function() {
    return this.props.width;
  },


  getHeight: function() {
    return this.props.height;
  },


  handleMouseOver: function(country) {
    var hl = country == "RUS" ? null : country;
    this.setHoveredCountry(hl);
  },


  handleMouseOut: function(country) {
    window.setTimeout(function() {
      if (this.state.hoveredCountry == country) {
        console.log("hovered country null");
        this.setHoveredCountry(null);
      }
    }.bind(this), 500);
  },


  componentWillUpdate: function(nextProps, nextState) {
    if (this.props.width !== nextProps.width) {
      this._projection = null;
    }
  },


  getConicConformalProjection: function() {
      var lo = 26.2206322; // x
      var la = 46.0485818 - 8; // y
      return d3.geo.conicConformal()
         .center([0, la])
         .rotate([-lo, 0])
         .scale(this.getWidth()*0.85)
         .translate([this.getWidth() / 2, this.getHeight() / 2]);
  },


  getAzimuthalEqualAreaProjection: function() {
      var lo = 22.2206322; // x
      var la = 34.0485818; // y

      return d3.geo.azimuthalEqualArea()
        //.clipAngle(180 - 1e-3)
        .center([0, la])
        .rotate([-lo, 0])
        .scale(this.getWidth()*0.85)
        .translate([this.getWidth() / 2, this.getHeight() / 2])
        .precision(.1);
  },


  getMercatorProjection: function() {
    var lo = 26.2206322; // x
    var la = 46.0485818; // y

    return d3.geo.mercator()
        .center([0, la])
        .rotate([-lo, 0])
        .scale(this.getWidth()*0.55)
        .translate([this.getWidth() / 2, this.getHeight() / 2])
  },


  getProjection: function() {
    if (!this._projection){
      this._projection = this.getAzimuthalEqualAreaProjection();
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


  handleStampChange: function(newStamp) {
    this.blockPlay = true;
    this.setState({stamp: parseInt(newStamp)});
    this.scheduleUnblockPlay();
  },


  handleSpeedChange: function(newSpeed) {
    //window.TRAILS_ENABLED = (newSpeed <= 12);
    //window.SPEED_RATIO = 60 * 60 * 24 * newSpeed;
    this.setState({speed: newSpeed});
  },



  render: function() {

    if (!this.props.refugeeCountsModel 
      || !this.props.refugeePointsModel
      || !this.props.mapModel) {
    
      return (
        <div className="refugee-map"
          style={{width: this.getWidth(), height: this.getHeight()}}>
          <div className="refugee-map__loading">Loading...</div>
        </div>
      );
    }

    return (
      <div className="refugee-map"
        style={{width: this.getWidth(), height: this.getHeight()}}>
        
        <BordersLayer 
          enableOverlay={true}
          {...this.getStandardLayerParams()}
          {...this.getHighlightLayerParams()}
          refugeeCountsModel={this.props.refugeeCountsModel}
          subunitClass="subunit" />

        <CountryLabelsLayer
          {...this.getStandardLayerParams()}
          {...this.getHighlightLayerParams()} />

        <CountryCountsLayer
          {...this.getStandardLayerParams()}
          {...this.getHighlightLayerParams()}
          refugeeCountsModel={this.props.refugeeCountsModel}  />

        <CountBarsLayer
          {...this.getStandardLayerParams()}
          highlightedCountry={this.getHighlightedCountry()}
          refugeeCountsModel={this.props.refugeeCountsModel} />

        <PointsLayer
          {...this.getStandardLayerParams()}
          highlightedCountry={this.getHighlightedCountry()}
          refugeePointsModel={this.props.refugeePointsModel} />
        
        <BordersLayer
          {...this.getStandardLayerParams()}
          subunitClass="subunit-invisible"
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut} 
          onClick={this.handleMapClick} />
        
        <ControlsAndLegend
          speed={this.state.speed}
          stamp={this.state.stamp}
          minStamp={this.props.startStamp}
          maxStamp={constants.DATA_END_MOMENT.unix()}
          onSpeedChange={this.handleSpeedChange} 
          onStampChange={this.handleStampChange} />

        <TimeLayer
          onMouseOver={this.handleStampChange}
          stamp={this.state.stamp}
          width={this.getWidth()}
          refugeeCountsModel={this.props.refugeeCountsModel} />

      </div>
    )
  }
});


// <Time stamp={this.state.stamp} />


module.exports = RefugeeMap;





