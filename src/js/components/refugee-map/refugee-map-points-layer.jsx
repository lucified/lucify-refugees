
var React = require('react');
var PIXI = require('pixi.js');

var isSafari = require('lucify-commons/src/js/lucify-utils.jsx').isSafari;

var RefugeeMapPointsLayer = React.createClass({


   componentDidMount: function() {
       this.graphics = {};
       this.sprites = {};
       this.initializePixiCanvas();
   },


   getWidth: function() {
    return this.props.width;
   },


   getHeight: function() {
      return this.props.height;
   },


   componentDidUpdate: function() {
      // todo: check performance

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
         "images/one-white-pixel.png",
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

    if (this.getWidth() !== this.lastWidth) {
      this.renderer.resize(this.getWidth(), this.getHeight());
    }
    
    this.lastWidth = this.getWidth();  

    this.refugeeContainer.removeChildren();

    this.props.refugeePointsModel.forEachActiveRefugee(this.props.stamp, function(r) {
        if (!r.sprite) {
          r.sprite = new PIXI.Sprite(this.refugeeTexture);
          r.sprite.alpha = 1.0;
        }

        var loc = r.getLocation(this.props.stamp);
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
             // safari gets slowed down a lot by alpha
             // that is not 0 or 1
             r.sprite.alpha = isSafari() ? 0.0 : 0.10;
           }
        }

        this.refugeeContainer.addChild(r.sprite);

    }.bind(this));
    
    var diff = this.props.stamp - this.previousStamp;
    var trailsEnabled = (diff > 0) && (diff < 60 * 60 * 5);
    
    this.previousStamp = this.props.stamp;

    this.renderer.clearBeforeRender = !trailsEnabled;
    this.renderer.render(this.stage);

    window.trailsEnabled = trailsEnabled;

    if (trailsEnabled) {
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