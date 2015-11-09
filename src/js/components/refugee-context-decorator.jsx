
var d3 = require('d3');
var topojson = require('topojson');
var React = require('react');
var console = require("console-browserify");
var Promise = require("bluebird");

var RefugeeCountsModel = require('../model/refugee-counts-model.js');
var RefugeePointsModel = require('../model/refugee-points-model.js');
var pointList = require('../model/point-list.js');
var MapModel = require('../model/map-model.js');

var lucifyUtils = require('lucify-commons/src/js/lucify-utils.jsx');
var assets = require('lucify-commons/src/js/lucify-assets.js');

Promise.promisifyAll(d3);

// Bind refugee and map data to given map component
//
// This is a React higher-order component as described here:
//   http://jamesknelson.com/structuring-react-applications-higher-order-components/
//   http://stackoverflow.com/questions/30845561/how-to-solve-this-using-composition-instead-of-mixins-in-react


var bindToRefugeeMapContext = function(Component) {

   return React.createClass({


      getDefaultProps: function() {
         return {
            smartSpreadEnabled: true,   // different values for these props have
            randomStartPoint: false     // not been tested and will probably result in bugs
         };
      },


      getPeoplePerPoint: function() {
         if (isFinite(this.props.peoplePerPoint)) {
             return this.props.peoplePerPoint;
         }

         if (lucifyUtils.isSlowDevice()) {
            return 50;
         }
         return 25;
      },


      getInitialState: function() {
         return {
            loaded: false,
            loadProgress: null,
            mapModel: null,
            refugeeCountsModel: null,
            refugeePointsModel: null
         };
      },


      componentDidMount: function() {

         console.time("load json");

         var promises = [];

         promises.push(d3.jsonAsync(assets.data('topomap.json')).then(function(data) {
            this.topomap = data;
         }.bind(this)));

         promises.push(d3.jsonAsync(assets.data('asylum.json')).then(function(data) {
            this.asylumData = data;
         }.bind(this)));

         Promise.all(promises).then(function() {
            console.timeEnd('load json');
            this.dataLoaded();
         }.bind(this), function(error){
            throw error;
         });
      },


      createPointList: function(mapModel) {
         return pointList.createFullList(
            mapModel, this.asylumData, this.getPeoplePerPoint(),
            this.props.randomStartPoint, this.props.smartSpreadEnabled);
      },


      progress: function(percent) {
         this.setState({loadProgress: percent});
      },


      initFeatures: function() {
         this.features = topojson.feature(this.topomap, this.topomap.objects.map);
         window.setTimeout(this.initMapModel, 15);
      },


      initMapModel: function() {
         console.time("init map model");
         this.mapModel = new MapModel(this.features);
         this.progress(20);
         console.timeEnd("init map model");
         window.setTimeout(this.initPointsList, 15);
      },


      initPointsList: function() {
         console.time("create points list");
         this.pointList = this.createPointList(this.mapModel);
         this.progress(85);
         console.timeEnd("create points list");
         window.setTimeout(this.initModels, 15);
      },


      initModels: function() {
         this.refugeePointsModel = new RefugeePointsModel(this.pointList, this.props.randomStartPoint, this.props.smartSpreadEnabled);
         this.refugeeCountsModel = new RefugeeCountsModel(this.asylumData);
         this.progress(95);  
         window.setTimeout(this.finishLoading, 15);
      },


      finishLoading: function() {
         this.setState({
            asylumData: this.asylumData,
            mapModel: this.mapModel,
            refugeePointsModel: this.refugeePointsModel,
            refugeeCountsModel: this.refugeeCountsModel,
            loaded: true,
            loadProgress: 100
         });

        // only for debugging
         window.refugeeCountsModel = this.refugeeCountsModel;
         window.refugeePointsModel = this.refugeePointsModel;
         window.mapModel = this.mapModel;
         window.asylumData = this.asylumData;
      },


      dataLoaded: function() {
         this.progress(10);

         // This will trigger also the other inits
         //
         // We need to use setTimeout to allow for the 
         // UI to update between parts of the loading 
         // progress.
         //
         // For optimal results we would have to allow
         // this also during individual steps in createPointList,
         // which is taking most of the load time.
         //
         this.initFeatures();
      },


      render: function() {
         return (
           <Component
            {...this.state}
            {...this.props}
            peoplePerPoint={this.getPeoplePerPoint()} />
        );
      }


   });

}


module.exports = bindToRefugeeMapContext;
