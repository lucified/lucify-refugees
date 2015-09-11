
var PIXI = require('pixi.js');



/*
 * Create a RefugeeMap backed
 * by the given RegugeeModel
 */
var RefugeeMap = function(rmodel) {
	this.rmodel = rmodel;
	this.width = 800;
	this.height = 800;
	this.initialize();
	this.graphics = {};
};


RefugeeMap.prototype.initialize = function() {
	var lo = 35.2206322; // x 
    var la = 53.0485818; // y
    
    this.projection = d3.geo.mercator()
    	.center([0, la])
    	.rotate([-lo, 0])
    	//.parallels([la - 10, la + 10])
    	.scale(this.height*0.75)
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
        this.width, this.height, 
        {transparent: true,
          roundPixels: true});
    this.renderer.roundPixels = true;

    d3.select('#canvas-wrap').node().appendChild(this.renderer.view);
    this.renderer.plugins.interaction.autoPreventDefault = false;
    this.stage = new PIXI.Container();
    this.stage.interactive = false;
}


RefugeeMap.prototype.drawRefugeePositionsPixi = function() {
    
    // this.stage.removeChildren();

    this.rmodel.activeRefugees.forEach(function(r) {

    	var key = r.endMoment.unix();

	    var g = this.graphics[key];

	    if (!g) {
	    	g = new PIXI.Graphics();
	    	g.beginFill(0xFFFFFF, 1.0);
			g.drawCircle(0, 0, 1);
	    	this.graphics[key] = g;
			this.stage.addChild(g);
	    }
		
		var loc = r.getLocation(this.rmodel.currentMoment);
		var point = this.projection(loc);
		
		g.x = point[0];
		g.y = point[1];

		// var graphics = new PIXI.Graphics();
		// graphics.beginFill(0xFFFFFF, 1.0);
		// graphics.drawCircle(0, 0, 1);
		
		// graphics.x = point[0];
		// graphics.y = point[1];

    }.bind(this));

    this.renderer.render(this.stage);
}


RefugeeMap.prototype.drawRefugeePositions = function() {
	return this.drawRefugeePositionsPixi();
}


RefugeeMap.prototype.drawRefugeePositionsSVG = function() {
	var sel = this.svg.selectAll('.refugee')
		.data(this.rmodel.refugees);

	sel
		.attr("cx", function(d) { 
			var loc = d.getLocation(this.rmodel.currentMoment);
			return this.projection(loc)[0];
		}.bind(this))
		.attr("cy", function(d) { 
			var loc = d.getLocation(this.rmodel.currentMoment);
			return this.projection(loc)[1];
		}.bind(this));

	sel.enter()
		.append('circle')
		.classed('refugee', true)
		.attr("cx", function(d) { 
			var loc = d.getLocation(this.rmodel.currentMoment);
			return this.projection(loc)[0];
		}.bind(this))
		.attr("cy", function(d) { 
			var loc = d.getLocation(this.rmodel.currentMoment);
			return this.projection(loc)[1];
		}.bind(this))
		.attr("r", 1)
		.attr("fill", "white");
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



module.exports = RefugeeMap;


