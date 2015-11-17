
var inside = require('point-in-polygon');
var Polygon = require('polygon');
var Vec2 = require('vec2');
var _ = require('underscore');
var countries = require("i18n-iso-countries");
var d3 = require('d3');

var MapModel = function(featureData) {
  this.featureData = featureData;
  //this.labelFeatureData = labelFeatureData;

  this._countryFeatureCache = {};
  this._countryBordersCache = {};
  this._countryCentersCache = {};
  this._countryBoundsCache = {};
  this._labelFeatureCache = {};

  this.initialize();
};


MapModel.prototype.initialize = function() {
  // the centroid isn't always good. fix for these countries:
  this._countryCentersCache["FRA"] = [2.449486512892406, 46.62237366531258];
  this._countryCentersCache["SWE"] = [15.273817, 59.803497];
  this._countryCentersCache["FIN"] = [25.356445, 61.490593];
  this._countryCentersCache["NOR"] = [8.506239, 60.975869];
  this._countryCentersCache["GBR"] = [-1.538086, 52.815213];
  this._countryCentersCache["GRC"] = [21.752930, 39.270271];
  this._countryCentersCache["RUS"] = [51.328125, 56.641127];
  this._countryCentersCache["HUN"] = [18.632813, 47.159840];
};

MapModel.prototype.containsCountry = function(country) {
  return this.getFeatureForCountry(country) != null;
};

MapModel.prototype.getFeatureForCountry = function(country) {
  if (this._countryFeatureCache[country]) return this._countryFeatureCache[country];

  var countryFeature = _.find(
    this.featureData.features,
    function(f) { return f.properties.ADM0_A3 == country; });

  if (countryFeature) {
    this._countryFeatureCache[country] = countryFeature;
    return countryFeature;
  }
  return null;
};

MapModel.prototype.getLabelPointForCountry = function(country) {

  var feature = this.getLabelFeatureForCountry(country);

  if (feature) {
    return feature.geometry.coordinates;
  }

  console.log("could not find label point for " + country);
  return [0, 0];
};


// MapModel.prototype.getLabelFeatureForCountry = function(country) {
//   if (this._labelFeatureCache[country]) return this._labelFeatureCache[country];
//   var feature = _.find(
//     this.labelFeatureData.features,
//     function(f) { return f.properties.sr_su_a3 == country; });
//   return feature;
// };


MapModel.prototype.getFriendlyNameForCountry = function(country) {
  switch(country) {
    case "SYR": return "Syria";
    case "MKD": return "Macedonia";
    case "IRN": return "Iran";
    case "LBY": return "Libya";
    case "RUS": return "Russia";
    case "RCB": return "Congo";
    case "COD": return "Congo";
  }
  return countries.getName(country, "en");
};


MapModel.prototype.getRandomPointFromCountry = function(country) {
  var feature = this.getFeatureForCountry(country);
  if (feature == null) {
    throw "could not find feature for " + country;
  }
  var borders = this.getMainCountryBorderForFeature(feature);
  return this.getRandomPointForCountryBorder(country, borders);
};

MapModel.prototype.getMainCountryBorderForFeature = function(feature) {
  var key = feature.properties.ADM0_A3;
  if (this._countryBordersCache[key] == null) {
    if (feature.geometry.type == "MultiPolygon") {
      this._countryBordersCache[key] = MapModel.getLargestPolygon(feature.geometry.coordinates);
    } else {
      this._countryBordersCache[key] = feature.geometry.coordinates[0];
    }
  }
  return this._countryBordersCache[key];
};

MapModel.prototype.getCenterPointOfCountry = function(country) {
  if (!this._countryCentersCache[country]) {
    var feature = this.getFeatureForCountry(country);
    if (feature == null) {
      //console.log("could not find feature for " + country);
      return [0, 0];
    }
    this._countryCentersCache[country] = d3.geo.centroid(feature);
  }
  return this._countryCentersCache[country];
};

/*
 * Get a random point within the polygon defined
 * by the coordinates in the given array
 */
MapModel.prototype.getRandomPointForCountryBorder = function(country, coordinates) {
  if (!this._countryBoundsCache[country]) {
    this._countryBoundsCache[country] = MapModel.getBounds(coordinates);
  }
  var bounds = this._countryBoundsCache[country];
  var la, lo;

  var count = 0;
  do {
    la = Math.random() * (bounds.maxLa - bounds.minLa) + bounds.minLa;
    lo = Math.random() * (bounds.maxLo - bounds.minLo) + bounds.minLo;
    count++;
  } while (!inside([la, lo], coordinates) && count < 100);

  if (count == 100) {
    console.log("could not create random point for " + country);
    return [0, 0];
  }
  return [la, lo];
};


/*
 * Get largest polygon within a GeoJSON
 * MultiPolygon coordinates array
 *
 * (used to figure out what is mainland)
 */
MapModel.getLargestPolygon = function(coordinates) {
  var largest = Number.MIN_VALUE;
  var ret = null;
  coordinates.forEach(function(item) {
    var va = item[0].map(function(point) {
      return Vec2(point[0], point[1]);
    });

    var p = new Polygon(va);
    var val = p.area();
    if (val > largest) {
      largest = val;
      ret = item[0];
    }
  });
  return ret;
};

MapModel.getBounds = function(coordinates) {
  var bounds = coordinates.reduce(function(previous, item) {
    previous.minLa = Math.min(item[0], previous.minLa);
    previous.maxLa = Math.max(item[0], previous.maxLa);
    previous.minLo = Math.min(item[1], previous.minLo);
    previous.maxLo = Math.max(item[1], previous.maxLo);

    return previous;

  }, {minLa: Number.MAX_VALUE,
    maxLa: Number.MIN_VALUE,
    minLo: Number.MAX_VALUE,
    maxLo: Number.MIN_VALUE});
  return bounds;
};


module.exports = MapModel;
