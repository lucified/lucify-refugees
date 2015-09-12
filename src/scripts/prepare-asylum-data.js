var XLS = require('xlsjs');
var _ = require('underscore');
var fs = require('fs');


var workbook = XLS.readFile('./data/asylum-data.xls');

//console.log(workbook);
//console.log(workbook.SheetNames);

var months = _.range(1, 8);

var originCountries = ['SYR', 'AFG', 'SRB', 'IRQ', 'ALB', 'ERT', 'PAK', 'SOM', 'CHI', 'UKR'];

var asylumCountries = _.range(10, 56).map(function(number) {
	var cell = workbook.Sheets.SYR["A" + number];

	var country;
	if (number == 50) {
		country = "USA";

	} else if (cell == null) {
		return null;

	} else {
		country = cell.v;
	}

	console.log(country);

	return {
		row: number,
		country: country
	}

}).filter(function(item) {
	return item !== null;
});


var getMonthLetter = function(month) {
	switch (month) {
		case 1: return 'C';
		case 2: return 'D';
		case 3: return 'E';
		case 4: return 'F';
		case 5: return 'G';
		case 6: return 'H';
		case 7: return 'I';
		case 8: return 'J';
	}
	throw "invalid month: " + month;
}


var getApplicationCount = function(month, asylumCountry, originCountry) {
	var cell = workbook.Sheets[originCountry][getMonthLetter(month) + asylumCountry.row];
	if (cell == null) {
		//console.log("error for " + month + asylumCountry.country + originCountry);
		return 0;
	}
	if (cell.v !== null && Number.isInteger(cell.v)) {
		return cell.v;
	}

	return 0;
}

var transformCountryCode = function(country) {
	switch (country) {
		case "AUL": return "AUS";
		case "AUS": return "AUT";
		case "BUL": return "BGR";
		case "CHI": return "CHN";
		case "ERT": return "ERI";
		case "DEN": return "DNK";
		case "GFR": return "DEU";
		case "GRE": return "GRC";
		case "ICE": return "ISL";
		case "IRE": return "IRL";
		case "MCD": return "MKD";
		case "MTA": return "MLT";
		case "NET": return "NLD";
		case "POR": return "PRT";
		case "ROM": return "ROU";
		case "SPA": return "ESP";
		case "SWI": return "CHE";
	}
	return country;
}

//console.log(months);
//console.log(asylumCountries);
//console.log(workbook.Sheets.SYR.H10.v);

var data = [];

months.forEach(function(month) {
	originCountries.forEach(function(oc) {
		asylumCountries.forEach(function(ac) {
			var count = getApplicationCount(month, ac, oc);
			var item = {
				oc: transformCountryCode(oc),
				ac: transformCountryCode(ac.country),
				month: month,
				year: 2015,
				count: count
			};
			data.push(item);
		});
	});
});


data = data.filter(function(item) {
	return item.count > 0;
});

//console.log(data);

fs.writeFileSync('data/asylum.json', JSON.stringify(data, null, 4));
