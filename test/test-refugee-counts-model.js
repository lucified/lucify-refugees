
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

lastDayStamp = function(year, month) {
	return moment([year, month + 1, 1]).subtract(1, 'days').unix();
}

describe('RefugeeCountsModel', function() {

	var stamp = moment([2015, 10, 21]).unix();
	var data = JSON.parse(fs.readFileSync('temp/data-assets/asylum.json'));
	var model = new RefugeeCountsModel(data);

	describe('asylumData', function() {
		it('correct total for germany during jan 2015', function() {
			assert.equal(data
				.filter(function(item) { 
					return item.ac == "DEU" && item.year==2012 && item.month==1})
				.reduce(function(prev, val) { return prev + val.count}, 0), 4667);
		});		
	})

	describe('pairCountsByDestination', function() {
		it('correct total for AFG -> DEU @ jan 2015', function() {
			assert.equal(model.pairCountsByDestination['DEU']['AFG'][3][0].count, 1129);
		});
	});

	describe('getTotalDestinationCounts', function() {
		it('correct total for germany after jan 2015', function() {
		 	assert.equal(model.getTotalDestinationCounts(
		 		'DEU', moment([2012, 0, 31]).unix()).asylumApplications, 4667);
		});		
		it('correct total for germany at end of 2014', function() {
			assert.equal(model.getTotalDestinationCounts('DEU', moment([2014, 11, 31]).unix())
				.asylumApplications, 346633);
		});
		it('correct total for finland at end of 2014', function() {
			assert.equal(model.getTotalDestinationCounts('FIN', moment([2014, 11, 31]).unix())
				.asylumApplications, 8894);
		});
	});

	describe('getOriginCountsByDestinationCountries()', function() {
		it('correct total for SYR->GER after one months end', function() {
			assert.equal(model.getOriginCountsByDestinationCountries(
				'SYR', lastDayStamp(2012, 0))['DEU'].asylumApplications, 210);
		});
		it('correct total for SYR->GER after two months end', function() {
			assert.equal(model.getOriginCountsByDestinationCountries(
				'SYR', lastDayStamp(2012, 1))['DEU'].asylumApplications, 440);
		});
	});

	describe('getDestinationCountsByOriginCountries()', function() {
		it('correct total for SYR->GER after one months end', function() {
			assert.equal(model.getDestinationCountsByOriginCountries(
				'DEU', lastDayStamp(2012, 0))['SYR'].asylumApplications, 210);
		});
		it('correct total for SYR->GER after two months end', function() {
			assert.equal(model.getDestinationCountsByOriginCountries(
				'DEU', lastDayStamp(2012, 1))['SYR'].asylumApplications, 440);
		});
	});


});
