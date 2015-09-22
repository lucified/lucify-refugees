
var PIXI = require('pixi.js');
var _ = require('underscore');
var MapModel = require('./map-model.js');

var React = require('react');
var BordersLayer = require('./refugee-map-borders-layer.jsx');
var CountryCountsLayer = require('./refugee-map-country-counts-layer.jsx');
var CountryLabelsLayer = require('./refugee-map-country-labels-layer.jsx');


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
   

  componentWillMount: function() {
    this.highlightedDestinationCountries = [];
    this.highlightedOriginCountries = [];
  },


  componentDidMount: function() {
    this.tickCount = 0;
    this.highlightedCountry = null;

    this.graphics = {};
    this.sprites = {};

    // this could also be in componentWillReceiveProps
    this.props.refugeeModel.onRefugeeUpdated = this.onRefugeeUpdated.bind(this);
    this.props.refugeeModel.onRefugeeFinished = this.onRefugeeFinished.bind(this);
    this.props.refugeeModel.onRefugeeStarted = this.onRefugeeStarted.bind(this);

    this.props.refugeeModel.onModelUpdated = this.update.bind(this);

    this.svg = d3.select(React.findDOMNode(this.refs.belowCanvas));
    this.overlaySvg = d3.select(React.findDOMNode(this.refs.aboveCanvas));

    this.initialize();
  },


  update: function() {
    this.setState({time: this.props.refugeeModel.currentMoment.unix()});
    this.drawRefugeeCounts();
    //this.updateCountryCountLabels();
    this.renderCanvas();
    this.tickCount++;
  },


  initialize: function() {
    this.initializePixiCanvas();
    
    d3.select('#canvas-wrap')
      .style('width', this.getWidth() + "px")
  },


  getWidth: function() {
    return this.props.width;
  },


  getHeight: function() {
    return this.props.height;
  },


  initializePixiCanvas: function() {
    PIXI.dontSayHello = true;
    PIXI.utils._saidHello = true;
    PIXI.doNotSayHello = true;
    PIXI.AUTO_PREVENT_DEFAULT = false;

    this.renderer = new PIXI.CanvasRenderer(
        this.getWidth(), this.getHeight(),
        {
          transparent: true,
          antialias: true,
          preserveDrawingBuffer: true,
          clearBeforeRender: false,
          view: React.findDOMNode(this.refs.canvas)
        });

    this.renderer.plugins.interaction.autoPreventDefault = false;

    this.stage = new PIXI.Container();

    this.refugeeContainer = new PIXI.Container();
    this.refugeeContainer.alpha = 1.0;
    this.stage.addChild(this.refugeeContainer);

    this.barContainer = new PIXI.Container();
    this.barContainer.alpha = 0.7;
    this.stage.addChild(this.barContainer);

    this.refugeeTexture = new PIXI.Texture.fromImage(
      "one-white-pixel.png",
      new PIXI.Rectangle(0, 0, 1, 1));
  },


  onRefugeeStarted: function(r) {
    r.sprite = new PIXI.Sprite(this.refugeeTexture);
    r.sprite.alpha = 1.0;
    this.refugeeContainer.addChild(r.sprite);
  },


  onRefugeeFinished: function(r) {
    this.refugeeContainer.removeChild(r.sprite);
  },


  onRefugeeUpdated: function(r) {
    var loc = r.location;
    var point = this.getProjection()(loc);
    r.sprite.position.x = point[0];
    r.sprite.position.y = point[1];

    if (this.highlightedCountry == null) {
      r.sprite.alpha = 1.0; // make all solid
    } else {
      if (r.originCountry == this.highlightedCountry) {
        r.sprite.alpha = 1.0;

        // make sure destination country is highlighted as well
        if (this.highlightedDestinationCountries.indexOf(r.destinationCountry) == -1) {
          this.drawCountryLabel(r.destinationCountry, "destination");
          this.highlightedDestinationCountries.push(r.destinationCountry);
        }
      } else if (r.destinationCountry == this.highlightedCountry) {
        r.sprite.alpha = 1.0;

        // make sure origin country is highlighted as well
        if (this.highlightedOriginCountries.indexOf(r.originCountry) == -1) {
          this.drawCountryLabel(r.originCountry, "origin");
          this.highlightedOriginCountries.push(r.originCountry);
        }
      } else {
        r.sprite.alpha = 0.2;
      }
    }
  },


  drawRefugeeCounts: function() {
    this.barContainer.removeChildren();
    var barSizeDivider = 3000;

    console.log("fdads");

    // kludge. should produce country list in a better way
    for (var country in this.props.refugeeModel.arrivedRefugeeCounts) {
      var refugeeCounts = this.props.refugeeModel.getCurrentRefugeeTotal(country);
      var bar = new PIXI.Graphics();
      bar.lineStyle(0);
      var asylumBarSize = refugeeCounts.asylumApplications / barSizeDivider;
      var refugeeBarSize = refugeeCounts.registeredRefugees / barSizeDivider;
      var coordinates = this.getProjection(mapModel.getCenterPointOfCountry(country));
      var asylumColor = 0xFFFFFF;
      var refugeeColor = 0xFFAD33;
      var bothBarsShown = (refugeeBarSize > 0 && asylumBarSize > 0);

      if (refugeeBarSize > 0) {
        bar.beginFill(refugeeColor);
        bar.drawRect(coordinates[0] + 1, coordinates[1], 5, -refugeeBarSize);
      }
      if (asylumBarSize > 0) {
        bar.beginFill(asylumColor);
        bar.drawRect(coordinates[0] - (bothBarsShown ? 6 : 2), coordinates[1], 5, -asylumBarSize);
      }
      this.barContainer.addChild(bar);
    }
  },


  renderCanvas: function() {
    this.renderer.clearBeforeRender = !window.TRAILS_ENABLED;
    this.renderer.render(this.stage);

    if (window.TRAILS_ENABLED) {
      // snippet adapted from earth.js
      // https://github.com/cambecc/earth/blob/master/public/libs/earth/1.0.0/earth.js
      // see draw()-function

      var g = this.renderer.view.getContext("2d");
      g.fillStyle = "rgba(0, 0, 0, 0.95)";

      var prevAlpha = g.globalAlpha;
      var prev = g.globalCompositeOperation;
      g.globalAlpha = 0.90;
      g.globalCompositeOperation = "destination-in";
      g.fillRect(0, 0, this.getWidth(), this.getHeight());
      g.globalCompositeOperation = prev;
      g.globalAlpha = prevAlpha;
    }
  },


  handleMouseOver: function(country) {
    this.setState({highlightedCountry: country});
  },


  handleMouseOut: function(country) {

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
    var style = {
      width: this.getWidth(),
      height: this.getHeight()
    }

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

        <canvas ref="canvas" style={style} />
        
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
