
var PIXI = require('pixi.js');
var utils = require('./utils.js');


/*
 * Create a RefugeeMap backed
 * by the given RefugeeModel
 */
var RefugeeMap = function(rmodel) {
	this.rmodel = rmodel;
	this.width = 1200;
	this.height = 1200;
	this.width = 1920;
	this.height = 1080;
	this.initialize();
	this.graphics = {};
	this.sprites = {};
	this.arrivedRefugeesByCountry = {};

	rmodel.onRefugeeUpdated = this.onRefugeeUpdated.bind(this);
	rmodel.onRefugeeFinished = this.onRefugeeFinished.bind(this);
	rmodel.onRefugeeStarted = this.onRefugeeStarted.bind(this);
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

	window.projection = this.projection;

	this.initializePixiCanvas();
	this.drawBorders();

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
    //this.renderer = new PIXI.CanvasRenderer(
        this.width, this.height,
        {transparent: true, 
        antialias: true, 
        preserveDrawingBuffer: true,
        clearBeforeRender: false});

    d3.select('#canvas-wrap').node().appendChild(this.renderer.view);
    this.renderer.plugins.interaction.autoPreventDefault = false;

    this.renderer.preserveDrawingBuffer = true;
    this.renderer.clearBeforeRender = false;

	//this.stage.interactive = false;

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
		new PIXI.math.Rectangle(0, 0, 1, 1));


	//this.refugeeContainer.

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
	//r.sprite.alpha = 0.7;
	this.refugeeContainer.addChild(r.sprite);
}


RefugeeMap.prototype.onRefugeeFinished = function(r) {
	this.refugeeContainer.removeChild(r.sprite);
	this.refugeeArrivedAt(r.destinationCountry, r.endPoint);
}


RefugeeMap.prototype.onRefugeeUpdated = function(r) {
	var loc = r.location;
	var point = this.projection(loc);
	r.sprite.position.x = point[0];
	r.sprite.position.y = point[1];
}



// RefugeeMap.prototype.drawRefugeePositionsPixi = function() {

// 	// var length = this.rmodel.activeRefugees.length;
// 	// for (var i = 0; i < length; i++) {
// 	// 	var r = this.rmodel.activeRefugees[i];
// 	// 	var key = r.endMomentUnix;
// 	//     var s = this.sprites[key];

// 	//     if (!s) {
// 	//     	s = new PIXI.Sprite(this.texture);
// 	//     	this.refugeeContainer.addChild(s);
// 	//     	this.sprites[key] = s;

// 	// 		r.onFinished.push(function() {
// 	// 	 		this.refugeeContainer.removeChild(s);
// 	// 		}.bind(this));
// 	//     }
// 	// 	var loc = r.getLocation(this.rmodel.currentMoment);
// 	// 	var point = this.projection(loc);
// 	// 	s.position.x = point[0];
// 	// 	s.position.y = point[1];
// 	// 	s.alpha = 0.7;
// 	// }

//     this.rmodel.activeRefugees.forEach(function(r) {
// 		if (!r.sprite) {
// 	    	r.sprite = new PIXI.Sprite(this.refugeeTexture);
// 	    	this.refugeeContainer.addChild(r.sprite);

// 			r.onFinished.push(function() {
// 		 		this.refugeeContainer.removeChild(r.sprite);
// 		 		this.refugeeArrivedAt(r.destinationCountry, r.endPoint);
// 			}.bind(this));
// 	    }

// 		var loc = r.getLocation(this.rmodel.currentMoment);
// 		var point = this.projection(loc);
// 		r.sprite.position.x = point[0];
// 		r.sprite.position.y = point[1];
//     }.bind(this));
// }


RefugeeMap.prototype.drawRefugeePositions = function() {
	return this.drawRefugeePositionsPixi();
}


RefugeeMap.prototype.drawRefugeeCountsPixi = function() {
	//if (this.barContainer) {
	//	this.stage.removeChild(this.barContainer);
	//}
	
	//this.barContainer = new PIXI.Container();
	//this.barContainer.alpha = 0.7;

	this.barContainer.removeChildren();

	for (var country in this.arrivedRefugeesByCountry) {
		var bar = new PIXI.Graphics();
		var count = this.arrivedRefugeesByCountry[country].count / 100;
		var coordinates = this.projection(this.arrivedRefugeesByCountry[country].point);
		var color = utils.isInMainlandEurope(country) ? 0xFFFFFF : 0xFF0000;
		bar.beginFill(color);
		bar.lineStyle(1, color);
		bar.drawRect(coordinates[0], coordinates[1], 5, -count);
		this.barContainer.addChild(bar);
	};

	//this.stage.addChild(this.barContainer);
}



RefugeeMap.prototype.drawRefugeeCounts = function() {
	return this.drawRefugeeCountsPixi();
}


RefugeeMap.prototype.render = function() {
	this.renderer.render(this.stage);

	var g = d3.select("canvas").node().getContext("2d");
    g.fillStyle = "rgba(0, 0, 0, 0.9999)";
    //g.fillStyle = "rgba(0, 0, 0, 0.95)";
     
    var prev = g.globalCompositeOperation;
    g.globalCompositeOperation = "destination-in";
    g.fillRect(0, 0, this.width, this.height);
    g.globalCompositeOperation = prev;
}


RefugeeMap.prototype.drawBorders = function() {
	var path = d3.geo.path().projection(this.projection);
	this.svg.append("path")
      .datum(fc)
      .attr("d", path);
}


RefugeeMap.prototype.drawLines = function() {
	this.rmodel.refugees.forEach(function(refugee) {
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

// Note: Will currently display bar at location where first refugee arrives at in the country
RefugeeMap.prototype.refugeeArrivedAt = function(country, point) {
	if (!this.arrivedRefugeesByCountry[country]) {
		this.arrivedRefugeesByCountry[country] = {
			point: point,
			count: 1
		};
	} else {
		this.arrivedRefugeesByCountry[country].count++;
	}
}


module.exports = RefugeeMap;



// RefugeeMap.prototype.drawRefugeePositionsSVG = function() {
// 	var sel = this.svg.selectAll('.refugee')
// 		.data(this.rmodel.refugees);

// 	sel
// 		.attr("cx", function(d) {
// 			var loc = d.getLocation(this.rmodel.currentMoment);
// 			return this.projection(loc)[0];
// 		}.bind(this))
// 		.attr("cy", function(d) {
// 			var loc = d.getLocation(this.rmodel.currentMoment);
// 			return this.projection(loc)[1];
// 		}.bind(this));

// 	sel.enter()
// 		.append('circle')
// 		.classed('refugee', true)
// 		.attr("cx", function(d) {
// 			var loc = d.getLocation(this.rmodel.currentMoment);
// 			return this.projection(loc)[0];
// 		}.bind(this))
// 		.attr("cy", function(d) {
// 			var loc = d.getLocation(this.rmodel.currentMoment);
// 			return this.projection(loc)[1];
// 		}.bind(this))
// 		.attr("r", 1)
// 		.attr("fill", "white");
// }


