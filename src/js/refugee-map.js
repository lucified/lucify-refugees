
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
	this.initialize();
	this.graphics = {};
	this.sprites = {};
	this.arrivedRefugeesByCountry = {};
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

    this.renderer = new PIXI.autoDetectRenderer(
    //this.renderer = new PIXI.CanvasRenderer(
        this.width, this.height,
        {transparent: true, antialias: true});

    d3.select('#canvas-wrap').node().appendChild(this.renderer.view);
    this.renderer.plugins.interaction.autoPreventDefault = false;

	//this.stage.interactive = false;

    //this.refugeeContainer = new PIXI.ParticleContainer(
    //	200000,
    //	[false, true, false, false, true],
	//	200000);

	this.refugeeContainer = new PIXI.Container();
	this.refugeeContainer.alpha = 0.7;
    this.barContainer = null;
    this.stage = new PIXI.Stage(0x000000);
    this.stage.addChild(this.refugeeContainer);

	this.refugeeTexture = new PIXI.Texture.fromImage(
		"one-white-pixel.png",
		new PIXI.math.Rectangle(0, 0, 1, 1));
}



RefugeeMap.prototype.drawRefugeePositionsPixi = function() {

	// var length = this.rmodel.activeRefugees.length;
	// for (var i = 0; i < length; i++) {
	// 	var r = this.rmodel.activeRefugees[i];
	// 	var key = r.endMomentUnix;
	//     var s = this.sprites[key];

	//     if (!s) {
	//     	s = new PIXI.Sprite(this.texture);
	//     	this.refugeeContainer.addChild(s);
	//     	this.sprites[key] = s;

	// 		r.onFinished.push(function() {
	// 	 		this.refugeeContainer.removeChild(s);
	// 		}.bind(this));
	//     }
	// 	var loc = r.getLocation(this.rmodel.currentMoment);
	// 	var point = this.projection(loc);
	// 	s.position.x = point[0];
	// 	s.position.y = point[1];
	// 	s.alpha = 0.7;
	// }


    this.rmodel.activeRefugees.forEach(function(r) {
		if (!r.sprite) {
	    	r.sprite = new PIXI.Sprite(this.refugeeTexture);
	    	this.refugeeContainer.addChild(r.sprite);

			r.onFinished.push(function() {
		 		this.refugeeContainer.removeChild(r.sprite);
		 		this.refugeeArrivedAt(r.destinationCountry, r.endPoint);
			}.bind(this));
	    }

		var loc = r.getLocation(this.rmodel.currentMoment);
		var point = this.projection(loc);
		r.sprite.position.x = point[0];
		r.sprite.position.y = point[1];
    }.bind(this));
}


RefugeeMap.prototype.drawRefugeePositions = function() {
	return this.drawRefugeePositionsPixi();
}

RefugeeMap.prototype.drawRefugeeCountsPixi = function() {
	if (this.barContainer) {
		this.stage.removeChild(this.barContainer);
	}
	this.barContainer = new PIXI.Container();
	this.barContainer.alpha = 0.7;
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
	this.stage.addChild(this.barContainer);
}

RefugeeMap.prototype.drawRefugeeCounts = function() {
	return this.drawRefugeeCountsPixi();
}

RefugeeMap.prototype.render = function() {
	this.renderer.render(this.stage);
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


