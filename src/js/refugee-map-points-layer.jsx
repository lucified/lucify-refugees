
var React = require('react');
var PIXI = require('pixi.js');


var RefugeeMapPointsLayer = React.createClass({


   componentDidMount: function() {
       this.graphics = {};
       this.sprites = {};

       // this could also be in componentWillReceiveProps
       this.props.refugeeModel.onRefugeeUpdated = this.onRefugeeUpdated;
       this.props.refugeeModel.onRefugeeFinished = this.onRefugeeFinished;
       this.props.refugeeModel.onRefugeeStarted = this.onRefugeeStarted;

       this.initializePixiCanvas();
   },


   getWidth: function() {
    return this.props.width;
   },


   getHeight: function() {
      return this.props.height;
   },


   componentDidUpdate: function() {
      this.renderCanvas();
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
             view: React.findDOMNode(this.getDOMNode())
           });

       this.renderer.plugins.interaction.autoPreventDefault = false;

       this.stage = new PIXI.Container();

       this.refugeeContainer = new PIXI.Container();
       this.refugeeContainer.alpha = 1.0;
       this.stage.addChild(this.refugeeContainer);

       // for some reason the trails do not work
       // unless there is some graphics sharing the stage
       // so we add a dummy graphics object
       var graphics = new PIXI.Graphics();
       this.stage.addChild(graphics);

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
      var point = this.props.projection(loc);
      r.sprite.position.x = point[0];
      r.sprite.position.y = point[1];

      if (this.props.highlightedCountry == null) {
           r.sprite.alpha = 1.0; // make all solid
      } else {
         if (r.originCountry == this.props.highlightedCountry) {
           r.sprite.alpha = 1.0;
         } else if (r.destinationCountry == this.props.highlightedCountry) {
           r.sprite.alpha = 1.0;
         } else {
           r.sprite.alpha = 0.10;
         }
      }
   },


  renderCanvas: function() {

    // for some strange reason the trails
    // do not work unless there is some other
    // graphic on the stage 
   
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


  render: function() {
      return <canvas style={{width: this.props.width, height: this.props.height}} />
  }

});



module.exports = RefugeeMapPointsLayer;