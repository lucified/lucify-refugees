var PIXI = require('pixi.js');
var MapModel = require('./map-model.js')

/*
 * Create a RefugeeMap backed
 * by the given RefugeeModel
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
  this.arrivedRefugeesByCountry = {};

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
    //.parallels([la - 10, la + 10])
    .scale(this.height*0.55)
    .translate([this.width / 2, this.height / 2]);

  this.svg = d3.select("#canvas-wrap").append("svg")
   .attr("width", this.width)
   .attr("height", this.height);

  // only for debugging
  window.projection = this.projection;

  this.initializePixiCanvas();
  
  this.drawBorders();
  this.drawCountryLabels();

  d3.select('#canvas-wrap')
    .style('width', this.width + "px")
    .style('height', this.height + "px");
}


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

  this.renderer.preserveDrawingBuffer = true;
  this.renderer.clearBeforeRender = false;

  //this.refugeeContainer = new PIXI.ParticleContainer(
  //	200000,
  //	[false, true, false, false, true],
  //	200000);

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

  // var g = new PIXI.Graphics();
  // g.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  // g.beginFill(0xFFFFFF, 0.05);
  // g.drawRect(0, 0, this.width, this.height);
  // this.refugeeContainer.addChild(g);

  //var rect = PIXI.Rectangle(0, 0, this.width; this.height);

     //var matrix = [
    //    0.2, 0, 0, 0, 0,
    //    0, 0.2, 0, 0, 0,
    //    0, 0, 0.2, 0, 0,
    //    0, 0, 0, 0, 0
    //];

  //var filter = new PIXI.filters.ColorMatrixFilter();
  //filter.matrix = matrix;
  //this.refugeeContainer.filters = [filter];
}


RefugeeMap.prototype.onRefugeeStarted = function(r) {
  r.sprite = new PIXI.Sprite(this.refugeeTexture);
  r.sprite.alpha = 1.0;
  this.refugeeContainer.addChild(r.sprite);
}


RefugeeMap.prototype.onRefugeeFinished = function(r) {
  this.refugeeContainer.removeChild(r.sprite);
  this.refugeeArrived(r);
}


RefugeeMap.prototype.onRefugeeUpdated = function(r) {
  var loc = r.location;
  var point = this.projection(loc);
  r.sprite.position.x = point[0];
  r.sprite.position.y = point[1];
}


RefugeeMap.prototype.drawRefugeePositions = function() {
  return this.drawRefugeePositionsPixi();
}


RefugeeMap.prototype.drawRefugeeCountsPixi = function() {
  this.barContainer.removeChildren();

  var barSizeDivider = 3000 / this.refugeeModel.peoplePerPoint;

  for (var country in this.arrivedRefugeesByCountry) {
    var bar = new PIXI.Graphics();
    bar.lineStyle(0);
    var asylumCount = this.arrivedRefugeesByCountry[country].asylumApplications / barSizeDivider;
    var refugeeCount = this.arrivedRefugeesByCountry[country].registeredRefugees / barSizeDivider;
    var coordinates = this.projection(this.arrivedRefugeesByCountry[country].point);
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
  };
}



RefugeeMap.prototype.drawRefugeeCounts = function() {
  return this.drawRefugeeCountsPixi();
}


RefugeeMap.prototype.render = function() {
  this.renderer.render(this.stage);

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


RefugeeMap.prototype.drawBorders = function() {
  var path = d3.geo.path().projection(this.projection);
  this.svg.append("path")
      .datum(this.mapModel.featureData)
      .attr("d", path);
}


RefugeeMap.prototype.drawLines = function() {
  this.refugeeModel.refugees.forEach(function(refugee) {
    this.drawRefugeeLine(refugee);
  }.bind(this));
}


RefugeeMap.prototype.drawRefugeeLine = function(refugee) {
  var sp = this.projection(refugee.startPoint);
  var ep = this.projection(refugee.endPoint);
  this.svg.append("line")
    .attr("x1", sp[0])
    .attr("y1", sp[1])
    .attr("x2", ep[0])
    .attr("y2", ep[1])
    .attr("stroke", "white");
}

// Note: Will currently display bar at location where first 
// refugee arrives at in the country
RefugeeMap.prototype.refugeeArrived = function(refugee) {
  if (!this.arrivedRefugeesByCountry[refugee.destinationCountry]) {
    this.arrivedRefugeesByCountry[refugee.destinationCountry] = {
      point: refugee.endPoint,
      asylumApplications: 0,
      registeredRefugees: 0
    };
  }

  if (refugee.isAsylumSeeker) {
    this.arrivedRefugeesByCountry[refugee.destinationCountry].asylumApplications++;
  } else {
    this.arrivedRefugeesByCountry[refugee.destinationCountry].registeredRefugees++;
  }
}


RefugeeMap.prototype.drawCountryLabels = function() {

  //var ids = ["FIN", "SWE", "DEU", "SYR", "FRA"];

  var ids = this.mapModel.labelFeatureData.features.map(function(item) {
    return item.properties.sr_su_a3;
  });
  
  ids.forEach(function(country) {
    this.drawCountryLabel(country);
  }.bind(this));

}



RefugeeMap.prototype.drawCountryLabel = function(country) {
  var point = this.projection(this.mapModel.getLabelPointForCountry(country));
  
  // this.svg.append("circle")
  //    .attr("cx", point[0])
  //    .attr("cy", point[1])
  //    .attr("r", 3)
  //    .attr("fill", "white");

  this.svg.append("text")
     .classed("country-label", true)
     .attr("x", point[0])
     .attr("y", point[1])
     .text(this.mapModel.getFriendlyNameForCountry(country));
}



// RefugeeMap.prototype.drawLine = function(country, month) {

//   this.svg.append("line")
//       var sp = this.projection(refugee.startPoint);
  
//   var ep = this.projection(refugee.endPoint);
//   this.svg.append("line")
//     .attr("x1", sp[0])
//     .attr("y1", sp[1])
//     .attr("x2", ep[0])
//     .attr("y2", ep[1])
//     .attr("stroke", "white");
// }


module.exports = RefugeeMap;

