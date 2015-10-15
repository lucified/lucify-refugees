
var React = require('react');
var PIXI = require('pixi.js');

var lucifyUtils = require('lucify-commons/src/js/lucify-utils.jsx'); 
var isSafari = lucifyUtils.isSafari;
var isSlowDevice = lucifyUtils.isSlowDevice;

var RefugeeMapPointsLayer = React.createClass({


   componentDidMount: function() {
       this.graphics = {};
       this.sprites = {};
       this.initializePixiCanvas();
   },


   updateForStamp: function(stamp) {
      this.stamp = stamp;
      this.renderCanvas();
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


   usesWebGLRenderer: function() {
      return isSlowDevice();
   },


   createRenderer: function() {
      var opts = {
          transparent: true,
          antialias: true,
          preserveDrawingBuffer: true,
          clearBeforeRender: false,
          view: React.findDOMNode(this.getDOMNode())
      }      
      if (this.usesWebGLRenderer()) {
        opts.preserveDrawingBuffer = false;
        opts.clearBeforeRender = true;
        return new PIXI.WebGLRenderer(this.getWidth(), this.getHeight(), opts)
      }

      return new PIXI.CanvasRenderer(this.getWidth(), this.getHeight(), opts);
   },


   initializePixiCanvas: function() {
       PIXI.dontSayHello = true;
       PIXI.utils._saidHello = true;
       PIXI.doNotSayHello = true;
       PIXI.AUTO_PREVENT_DEFAULT = false;

       this.renderer = this.createRenderer();
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


   getStamp: function() {
      return this.stamp;
   },


   renderCanvas: function() {

    if (this.getWidth() !== this.lastWidth) {
      this.renderer.resize(this.getWidth(), this.getHeight());
    }
    
    this.lastWidth = this.getWidth();  

    this.refugeeContainer.removeChildren();

    this.props.refugeePointsModel.forEachActiveRefugee(this.getStamp(), function(r) {
        if (!r.sprite) {
          r.sprite = new PIXI.Sprite(this.refugeeTexture);
          r.sprite.alpha = 1.0;
        }

        var loc = r.getLocation(this.getStamp());
        var point = this.props.projection(loc);
        r.sprite.position.x = point[0];
        r.sprite.position.y = point[1];

        if (this.props.highlightedCountry == null) {
             r.sprite.alpha = 1.0; // make all solid
        } else {
           if (r.originCountry === this.props.highlightedCountry) {
             r.sprite.alpha = 1.0;
           } else if (r.destinationCountry === this.props.highlightedCountry) {
             r.sprite.alpha = 1.0;
           } else {
             // safari gets slowed down a lot by alpha
             // that is not 0 or 1
             r.sprite.alpha = isSafari() ? 0.0 : 0.10;
           }
        }

        // this gives best performance
        if (r.sprite.alpha == 1.0) {
          this.refugeeContainer.addChild(r.sprite);  
        }

    }.bind(this));
    
    var diff = this.getStamp() - this.previousStamp;
    var trailsEnabled = !this.usesWebGLRenderer() 
      && (diff > 0) && (diff < 60 * 60 * 5);
    
    this.previousStamp = this.getStamp();

    this.renderer.clearBeforeRender = !trailsEnabled;
    this.renderer.render(this.stage);

    if (trailsEnabled) {
      // snippet adapted from earth.js
      // https://github.com/cambecc/earth/blob/master/public/libs/earth/1.0.0/earth.js
      // see draw()-function
      var g = this.renderer.view.getContext("2d");
      if (g != null) {
        g.fillStyle = "rgba(0, 0, 0, 0.95)";
        var prevAlpha = g.globalAlpha;
        var prev = g.globalCompositeOperation;
        g.globalAlpha = 0.90;
        g.globalCompositeOperation = "destination-in";
        g.fillRect(0, 0, this.getWidth(), this.getHeight());
        g.globalCompositeOperation = prev;
        g.globalAlpha = prevAlpha;
      }
    }

  },

  render: function() {
      return <canvas style={{width: this.props.width, height: this.props.height}} />
  }


});



module.exports = RefugeeMapPointsLayer;