
var _ = require('underscore');

var React = require('react');
var BordersLayer = require('./refugee-map-borders-layer.jsx');
var CountryCountsLayer = require('./refugee-map-country-counts-layer.jsx');
var CountryLabelsLayer = require('./refugee-map-country-labels-layer.jsx');
var CountBarsLayer = require('./refugee-map-count-bars-layer.jsx');
var PointsLayer = require('./refugee-map-points-layer.jsx')
var RefugeeMapLineChart = require('./refugee-map-line-chart.jsx');

var ControlsAndLegend = require('./refugee-map-controls-and-legend.jsx');

var constants = require('../../model/refugee-constants.js');

var RefugeeHighlightMixin = require('./refugee-highlight-mixin.js');

var FrameRateLayer = require('./frame-rate-layer.jsx');


var RefugeeMap = React.createClass({


  mixins: [RefugeeHighlightMixin],


  getDefaultProps: function() {
    return {
      width: 1200,
      height: 1200,
    }
  },


  getWidth: function() {
    return this.props.width;
  },


  getHeight: function() {
    return this.props.height;
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
      stamp: this.getStamp(),
      addStampListener: this.props.addStampListener
    }
  },


  handleMouseOver: function(country) {
    this.pendingHoverOut = false;
    var hl = country == "RUS" ? null : country;
    this.setHoveredCountry(hl);
  },


  handleMouseOut: function(country) {
    this.pendingHoverOut = true;
    window.setTimeout(function() {
      if (this.pendingHoverOut) {
        //console.log("setting hoveredCountry to null");
        this.setHoveredCountry(null);
      }
    }.bind(this), 500);
  },


  componentWillMount: function() {
      this.stamp = this.props.stamp;
      this.props.addStampListener(this.updateForStamp);
  },


  updateForStamp: function(stamp) {
      this.stamp = stamp;
      if (this.refs.pointsLayer != null) {
        this.refs.pointsLayer.updateForStamp(stamp);  
        this.refs.frameRateLayer.update();
        this.refs.bordersLayer.updateForStamp(stamp);
      }
  },


  getStamp: function() {
      return this.stamp;
  },


  render: function() {

    console.log("render refugee map");

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
          ref="bordersLayer"
          updatesEnabled={true}
          enableOverlay={true}
          {...this.getStandardLayerParams()}
          {...this.getHighlightLayerParams()}
          refugeeCountsModel={this.props.refugeeCountsModel}
          subunitClass="subunit" />

        <PointsLayer
           ref="pointsLayer"
           {...this.getStandardLayerParams()}
           highlightedCountry={this.getHighlightedCountry()}
           refugeePointsModel={this.props.refugeePointsModel} />
        
        <FrameRateLayer ref="frameRateLayer" />

        <BordersLayer
            updatesEnabled={true}
            {...this.getStandardLayerParams()}
            subunitClass="subunit-invisible"
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut} 
            onClick={this.handleMapClick} />

      </div>
    )
  }
});



module.exports = RefugeeMap;


     



        // <CountryLabelsLayer
        //   {...this.getStandardLayerParams()}
        //   {...this.getHighlightLayerParams()} />

        // <CountryCountsLayer
        //   {...this.getStandardLayerParams()}
        //   {...this.getHighlightLayerParams()}
        //   refugeeCountsModel={this.props.refugeeCountsModel}  />

        // <CountBarsLayer
        //   {...this.getStandardLayerParams()}
        //   highlightedCountry={this.getHighlightedCountry()}
        //   refugeeCountsModel={this.props.refugeeCountsModel} />
        

// <ControlsAndLegend
//      speed={this.props.speed}
//      stamp={this.props.stamp}
//      minStamp={this.props.startStamp}
//      maxStamp={constants.DATA_END_MOMENT.unix()}
//      onSpeedChange={this.props.handleSpeedChange} 
//      onStampChange={this.props.handleStampChange} />


     // <BordersLayer
     //      updatesEnabled={true}
     //      {...this.getStandardLayerParams()}
     //      subunitClass="subunit-invisible"
     //      onMouseOver={this.handleMouseOver}
     //      onMouseOut={this.handleMouseOut} 
     //      onClick={this.handleMapClick} />
