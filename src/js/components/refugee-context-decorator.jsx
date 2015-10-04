
var d3 = require('d3');
var topojson = require('topojson');
var React = require('react');

var RefugeeCountsModel = require('../model/refugee-counts-model.js');
var RefugeePointsModel = require('../model/refugee-points-model.js');
var pointList = require('../model/point-list.js');
var MapModel = require('../model/map-model.js');

var Promise = require("bluebird");
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
            peoplePerPoint: 25,
            includeRegionalData: true
         }
      },


      getInitialState: function() {
         return {
            mapModel: null,
            refugeeCountsModel: null,
            refugeePointsModel: null
         }
      },


      componentDidMount: function() {

         console.time("load json");

         var promises = [];

         promises.push(d3.jsonAsync('topomap.json').then(function(data) {
            this.topomap = data;
         }.bind(this)));

         promises.push(d3.jsonAsync('asylum.json').then(function(data) {
            this.asylumData = data;
         }.bind(this)));

         if (this.props.includeRegionalData) {
            promises.push(d3.jsonAsync('regional-movements.json').then(function(data) {
               this.regionalData = data;
            }.bind(this)));
         }   

         //var p4 = d3.jsonAsync('labels.json').then(function(data) {
         //   labels = data;
         //   window.labels = labels;
         //}.bind(this));

         Promise.all(promises).then(function() {
            console.timeEnd('load json');
            this.dataLoaded();
         }.bind(this), function(error){
            throw error;
         });
      },


      createPointList: function(mapModel) {
         return pointList.createFullList(
            mapModel, this.asylumData, this.regionalData, this.props.peoplePerPoint);
      },


      dataLoaded: function() {
         var features = topojson.feature(this.topomap, this.topomap.objects.map);

         console.time("init map model");
         var mapModel = new MapModel(features);
         console.timeEnd("init map model");

         console.time("create points list");
         var pointList = this.createPointList(mapModel);
         console.timeEnd("create points list");

         var refugeePointsModel = new RefugeePointsModel(pointList);
         var refugeeCountsModel = new RefugeeCountsModel(this.asylumData, this.regionalData);

         this.setState({
            mapModel: mapModel,
            refugeePointsModel: refugeePointsModel,
            refugeeCountsModel: refugeeCountsModel
         });

         // only for debugging
         window.refugeeCountsModel = refugeeCountsModel;
         window.refugeePointsModel = refugeePointsModel;
         window.mapModel = mapModel;
      },


      render: function() {
         return <Component {...this.state} {...this.props} />
      }


   });

}


module.exports = bindToRefugeeMapContext;
