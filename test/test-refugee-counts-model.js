
var assert = require('assert');
var should = require('should');
var fs = require('fs');
var moment = require('moment');

var RefugeeCountsModel = require('../src/js/model/refugee-counts-model.js');


// for some reason the "total values"
// http://popstats.unhcr.org/en/asylum_seekers_monthly
// displays invalid sums
//
// also the csv export has some more values than the
// web view
//

describe('RefugeeCountsModel', function() {

	var stamp = moment([2015, 10, 21]).unix();
	var data = JSON.parse(fs.readFileSync('temp/data-assets/asylum.json'));
	var model = new RefugeeCountsModel(data);

	//describe('pairCounts', function() {
	//
	//})

	describe('pairCountsByDestination', function() {
		it('correct total for AFG -> DEU @ jan 2015', function() {
			assert.equal(model.pairCountsByDestination['DEU']['AFG'][3][0].count, 1129);
		});
	});


	describe('getTotalDestinationCounts', function() {
		it('correct total for germany after one months end', function() {
		 	assert.equal(model.getTotalDestinationCounts(
		 		'DEU', moment([2012, 0, 31]).unix()).asylumApplications, 4667);
		});		

		it('correct total for germany after one months end (internal check)', function() {
			assert.equal(data
				.filter(function(item) { 
					return item.ac == "DEU" && item.year==2012 && item.month==1})
				.reduce(function(prev, val) { return prev + val.count}, 0), 4667);
		});		

		it('correct total for germany at end', function() {
			assert.equal(model.getTotalDestinationCounts('DEU', stamp).asylumApplications, 607494);
		});
		it('correct total for finland at end', function() {
			assert.equal(model.getTotalDestinationCounts('FIN', stamp).asylumApplications, 14196);
		});
	});


});
