
var moment = require('moment');

// note that month indices are zero-based

module.exports.DATA_START_YEAR = 2012;
module.exports.DATA_START_MONTH = 0;

module.exports.DATA_END_YEAR = 2015;
module.exports.DATA_END_MONTH = 9;

module.exports.DATA_END_MOMENT = moment([
	module.exports.DATA_END_YEAR,
	module.exports.DATA_END_MONTH, 30]);

module.exports.ASYLUM_APPLICANTS_DATA_UPDATED_MOMENT = moment([2015, 10, 24]);
module.exports.SYRIA_REFUGEES_DATA_UPDATED_MOMENT = moment([2015, 10, 17]);

module.exports.disableLabels = ['BIH', 'MKD', 'ALB', 'LUX', 'MNE', 'ARM', 'AZE', 'LBN'];

module.exports.labelShowBreakPoint = 992;
