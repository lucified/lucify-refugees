var PIXI = require('pixi.js');
var MapModel = require('./map-model.js');


/*
 * Create a RefugeeMap backed
 * by the given RefugeeModel and MapModel
 */
var RefugeeMap = function(refugeeModel, mapModel) {
  this.refugeeModel = refugeeModel;
  this.mapModel = mapModel;
  this.width = 1200;
  this.height = 1200;

  if (window.HD_RESOLUTION) {
    this.width = 1920;
    this.height = 1080;
  }

  this.initialize();
  this.graphics = {};
  this.sprites = {};

  this.refugeeModel.onRefugeeUpdated = this.onRefugeeUpdated.bind(this);
  this.refugeeModel.onRefugeeFinished = this.onRefugeeFinished.bind(this);
  this.refugeeModel.onRefugeeStarted = this.onRefugeeStarted.bind(this);
};


RefugeeMap.prototype.initialize = function() {
  var lo = 26.2206322; // x
  var la = 46.0485818; // y

  this.projection = d3.geo.mercator()
    .center([0, la])
    .rotate([-lo, 0])
    .scale(this.height*0.55)
    .translate([this.width / 2, this.height / 2]);

  // this.projection = d3.geo.orthographic()
  //   .center([0, la])
  //   .rotate([-lo, 0])
  //   .scale(this.height*0.55)
  //   .translate([this.width / 2, this.height / 2]);

  this.svg = d3.select("#canvas-wrap").append("svg")
   .attr("width", this.width)
   .attr("height", this.height);

  // only for debugging
  window.projection = this.projection;

  this.initializePixiCanvas();

  this.overlaySvg = d3.select("#canvas-wrap").append("svg")
   .attr("width", this.width)
   .attr("height", this.height);

  this.drawBorders();
  //this.drawCountryLabels();

  d3.select('#canvas-wrap')
    .style('width', this.width + "px")
    .style('height', this.height + "px");
};


RefugeeMap.prototype.initializePixiCanvas = function() {
  PIXI.dontSayHello = true;
  PIXI.utils._saidHello = true;
  PIXI.doNotSayHello = true;
  PIXI.AUTO_PREVENT_DEFAULT = false;

  this.renderer = new PIXI.CanvasRenderer(
      this.width, this.height,
      {transparent: true,
      antialias: true,
      preserveDrawingBuffer: true,
      clearBeforeRender: false});

  d3.select('#canvas-wrap').node().appendChild(this.renderer.view);
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
};


RefugeeMap.prototype.onRefugeeStarted = function(r) {
  r.sprite = new PIXI.Sprite(this.refugeeTexture);
  r.sprite.alpha = 1.0;
  this.refugeeContainer.addChild(r.sprite);
};


RefugeeMap.prototype.onRefugeeFinished = function(r) {
  this.refugeeContainer.removeChild(r.sprite);
};


RefugeeMap.prototype.onRefugeeUpdated = function(r) {
  var loc = r.location;
  var point = this.projection(loc);
  r.sprite.position.x = point[0];
  r.sprite.position.y = point[1];
};


RefugeeMap.prototype.drawRefugeeCountsPixi = function() {
  this.barContainer.removeChildren();

  var barSizeDivider = 3000 / this.refugeeModel.peoplePerPoint;
  var arrivedRefugeesByCountry = this.refugeeModel.arrivedRefugeesByCountry;

  for (var country in arrivedRefugeesByCountry) {
    var bar = new PIXI.Graphics();
    bar.lineStyle(0);
    var asylumCount = arrivedRefugeesByCountry[country].asylumApplications / barSizeDivider;
    var refugeeCount = arrivedRefugeesByCountry[country].registeredRefugees / barSizeDivider;
    var coordinates = this.projection(arrivedRefugeesByCountry[country].point);
    var asylumColor = 0xFFFFFF;
    var refugeeColor = 0xFFAD33;

    if (refugeeCount > 0) {
      bar.beginFill(refugeeColor);
      bar.drawRect(coordinates[0], coordinates[1], 5, -refugeeCount);
    }
    if (asylumCount > 0) {
      bar.beginFill(asylumColor);
      bar.drawRect(coordinates[0], coordinates[1]-refugeeCount, 5, -asylumCount);
    }
    this.barContainer.addChild(bar);
  }
};


RefugeeMap.prototype.drawRefugeeCounts = function() {
  return this.drawRefugeeCountsPixi();
  //this.drawCountryCountLabels();
  //return this.drawRefugeeCountsPixi();
};


RefugeeMap.prototype.render = function() {
  this.renderer.clearBeforeRender = !window.TRAILS_ENABLED;
  this.renderer.render(this.stage);

  if (window.TRAILS_ENABLED) {
    // snippet adapted from earth.js
    // https://github.com/cambecc/earth/blob/master/public/libs/earth/1.0.0/earth.js
    // see draw()-function
    var g = d3.select("canvas").node().getContext("2d");
    g.fillStyle = "rgba(0, 0, 0, 0.95)";

    var prevAlpha = g.globalAlpha;
    var prev = g.globalCompositeOperation;
    g.globalAlpha = 0.90;
    g.globalCompositeOperation = "destination-in";
    g.fillRect(0, 0, this.width, this.height);
    g.globalCompositeOperation = prev;
    g.globalAlpha = prevAlpha;
  }
}


RefugeeMap.prototype.drawBorders = function() {
  this._drawBorders(this.svg, 'subunit');
  var sel = this._drawBorders(this.overlaySvg, 'subunit-invisible');

  sel.on("mouseover", function(feature) {
    this.handleMouseOver(feature.properties.ADM0_A3);
  }.bind(this));

  sel.on("mouseout", function(feature) {
    this.handleMouseOut(feature.properties.ADM0_A3);
  }.bind(this));
};


RefugeeMap.prototype.handleMouseOver = function(country) {
  this.drawCountryLabel(country);
};

RefugeeMap.prototype.handleMouseOut = function(country) {
 this.removeCountryLabel(country);
};


RefugeeMap.prototype._drawBorders = function(svg, className) {
  var path = d3.geo.path().projection(this.projection);
  var sel = svg.selectAll('.' + className)
    .data(this.mapModel.featureData.features)
    .enter()
      .append('path')
      .classed(className, true)
      .attr("d", path);

  return sel;
};


RefugeeMap.prototype.drawCountryLabels = function() {
  //var ids = ["FIN", "SWE", "DEU", "SYR", "FRA"];
  var ids = this.mapModel.labelFeatureData.features.map(function(item) {
    return item.properties.sr_su_a3;
  });

  ids.forEach(function(country) {
    this.drawCountryLabel(country);
    this.drawCountryCountLabel(country);
  }.bind(this));
};


RefugeeMap.prototype.drawCountryLabel = function(country) {
  var point = this.projection(this.mapModel.getCenterPointOfCountry(country));

  this.svg.append("text")
     .classed("country-label", true)
     .classed(country, true)
     .attr("x", point[0])
     .attr("y", point[1] + 15)
     .text(this.mapModel.getFriendlyNameForCountry(country));
};


RefugeeMap.prototype.drawCountryCountLabel = function(country) {
  if (!this.refugeeModel.arrivedRefugeesByCountry[country]) {
    console.log("is null for" + country);
    return;
  }

  var point = this.projection(this.mapModel.getCenterPointOfCountry(country));
  var asylumCount = this.refugeeModel.arrivedRefugeesByCountry[country].asylumApplications;
  var refugeeCount = this.refugeeModel.arrivedRefugeesByCountry[country].registeredRefugees;

  console.log("here");

  this.svg.append("text")
     .classed("country-count", true)
     .classed(country, true)
     .attr("x", point[0])
     .attr("y", point[1] + 30)
     .text(asylumCount+refugeeCount);
};


RefugeeMap.prototype.removeCountryLabel = function(country) {
  this.svg.selectAll(".country-label." + country).remove();
};


module.exports = RefugeeMap;
