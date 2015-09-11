
var inside = require('point-in-polygon');
var Polygon = require('polygon');
var Vec2 = require('vec2');


/*
 * Get the feature for the given country
 * within a FeatureCollection
 */
var getFeatureForCountry = function(fc, country) {
	for (var i = 0; i < fc.features.length; i++) {
		var f = fc.features[i];
		if (f.properties.ADM0_A3 == country) {
			return f;
		}
	}
	throw "could not find country" + country;
}


/*
 * Get largest polygon within a GeoJSON 
 * MultiPolygon coordinates array
 *
 * (used to figure out what is mainland)
 */
var getLargestPolygon = function(coordinates) {
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
}


/*
 * Get a random point within the polygon defined
 * by the coordinates in the given array
 */
var getRandomPoint = function(coordinates) {
	var bounds = getBounds(coordinates);

	var count = 0;
	do {
		var la = Math.random() * (bounds.maxLa - bounds.minLa) + bounds.minLa;
		var lo = Math.random() * (bounds.maxLo - bounds.minLo) + bounds.minLo;
		count++;

	} while (!inside([la, lo], coordinates) && count < 100) 

	if (count == 100) {
		console.log("could not create random point");
		return;
	}
	return [la, lo];
}


var countryBorders = {};


var getMainCountryBorder = function(feature) {
	if (feature.geometry.type == "MultiPolygon") {
		return getLargestPolygon(feature.geometry.coordinates);
	}
	return feature.geometry.coordinates[0];
}

var getMainCountryBorderCached = function(feature) {
	var key = feature.properties.ADM0_A3;
	if (countryBorders[key] == null) {
		countryBorders[key] = getMainCountryBorder(feature);
	}
	return countryBorders[key];
}


var getRandomPointForCountryBorderFeature = function(feature) {
	return getRandomPoint(getMainCountryBorderCached(feature));
	//if (feature.geometry.type == "MultiPolygon") {
	//	return getRandomPoint(this.getLargestPolygon(feature.geometry.coordinates));
	//}
	//return getRandomPoint(feature.geometry.coordinates[0]);
}


var getBounds = function(coordinates) {
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
}

module.exports.getRandomPointForCountryBorderFeature = getRandomPointForCountryBorderFeature;
module.exports.getFeatureForCountry = getFeatureForCountry;
module.exports.getLargestPolygon = getLargestPolygon;
module.exports.getRandomPoint = getRandomPoint;
module.exports.getBounds = getBounds;

