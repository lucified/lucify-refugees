
var PIXI = require('pixi.js');
var _ = require('underscore');
var MapModel = require('./map-model.js');

var React = require('react');



var RefugeeMap = React.createClass({


  //if (window.HD_RESOLUTION) {
  //  this.getWidth() = 1920;
  //  this.height = 1080;
  //}


  getDefaultProps: function() {
    return {
      width: 1200,
      height: 1200
    }
  },


  componentDidMount: function() {
    this.tickCount = 0;
    this.highlightedCountry = null;
    this.highlightedDestinationCountries = [];
    this.highlightedOriginCountries = [];
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
    this.drawRefugeeCounts();
    this.updateCountryCountLabels();
    this.renderCanvas();
    this.tickCount++;
  },


  initialize: function() {
    var lo = 26.2206322; // x
    var la = 46.0485818; // y

    this.projection = d3.geo.mercator()
      .center([0, la])
      .rotate([-lo, 0])
      .scale(this.getWidth()*0.55)
      .translate([this.getWidth() / 2, this.getHeight() / 2]);

    // this.projection = d3.geo.orthographic()
    //   .center([0, la])
    //   .rotate([-lo, 0])
    //   .scale(this.height*0.55)
    //   .translate([this.getWidth() / 2, this.height / 2]);

    // only for debugging
    window.projection = this.projection;
    this.initializePixiCanvas();
    this.drawBorders();

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

    //React.findDOMNode(this.refs.canvasWrap).appendChild(this.renderer.view);

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
    var point = this.projection(loc);
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
    // kludge. should produce country list in a better way
    for (var country in this.props.refugeeModel.arrivedRefugeeCounts) {
      var refugeeCounts = this.props.refugeeModel.getCurrentRefugeeTotal(country);
      var bar = new PIXI.Graphics();
      bar.lineStyle(0);
      var asylumBarSize = refugeeCounts.asylumApplications / barSizeDivider;
      var refugeeBarSize = refugeeCounts.registeredRefugees / barSizeDivider;
      var coordinates = this.projection(mapModel.getCenterPointOfCountry(country));
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


  drawBorders: function() {
    this._drawBorders(this.svg, 'subunit');
    var sel = this._drawBorders(this.overlaySvg, 'subunit-invisible');

    sel.on("mouseover", function(feature) {
      this.handleMouseOver(feature.properties.ADM0_A3);
    }.bind(this));

    sel.on("mouseout", function(feature) {
      this.handleMouseOut(feature.properties.ADM0_A3);
    }.bind(this));
  },


  _drawBorders: function(svg, className) {
    var path = d3.geo.path().projection(this.projection);
    var sel = svg.selectAll('.' + className)
      .data(this.props.mapModel.featureData.features)
      .enter()
        .append('path')
        .classed(className, true)
        .attr("d", path);

    return sel;
  },


  handleMouseOver: function(country) {
    this.drawCountryLabel(country, "hovered");
    this.showCountryCount(country);
    this.highlightedCountry = country;
  },


  handleMouseOut: function(country) {
    this.removeCountryLabel(country);
    this.hideCountryCount(country);
    this.highlightedCountry = null;
    var i;
    for (i = 0; i < this.highlightedDestinationCountries.length; i++) {
      this.removeCountryLabel(this.highlightedDestinationCountries[i]);
    }
    for (i = 0; i < this.highlightedOriginCountries.length; i++) {
      this.removeCountryLabel(this.highlightedOriginCountries[i]);
    }
    this.highlightedDestinationCountries = [];
    this.highlightedOriginCountries = [];
  },


  showCountryCount: function(country) {
    var point = this.projection(this.props.mapModel.getCenterPointOfCountry(country));
    this.countryCountSelection = this.svg
                                  .selectAll('.country-count')
                                  .data([{country: country, point: point}]);

    this.countryCountSelection.enter().append('text')
      .classed("country-count", true)
      .attr("x", function(data) { return data.point[0]; })
      .attr("y", function(data) { return 30 + data.point[1]; });

    this.updateCountryCountLabels();
  },


  hideCountryCount: function(country) {
    this.countryCountSelection.remove();
    this.countryCountSelection = null;
  },


  drawCountryLabel: function(country, type) {
    var point = this.projection(this.props.mapModel.getCenterPointOfCountry(country));
    this.svg.append("text")
       .classed("country-label", true)
       .classed(country, true)
       .classed(type, true)
       .attr("x", point[0])
       .attr("y", point[1] + 15)
       .text(this.props.mapModel.getFriendlyNameForCountry(country));
  },


  updateCountryCountLabels: function() {
    if (this.tickCount % 5 != 0) {
      return;
    }

    if (this.countryCountSelection) {
      this.countryCountSelection.text(function(data) {
        var counts = this.props.refugeeModel.getCurrentRefugeeTotal(data.country);
        return counts.asylumApplications + counts.registeredRefugees;
      }.bind(this));
    }
  },

  
  removeCountryLabel: function(country) {
    this.svg.selectAll(".country-label." + country).remove();
  },


  render: function() {
    var style = {
      width: this.getWidth(),
      height: this.getHeight()
    }

    return (
      <div className="refugee-map">
        <svg ref="belowCanvas" style={style} />
        <canvas ref="canvas" style={style} />
        <svg ref="aboveCanvas" style={style} />
      </div>
    )
  }


});




module.exports = RefugeeMap;
