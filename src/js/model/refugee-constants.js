
var moment = require('moment');

// note that month indices are zero-based

module.exports.DATA_START_YEAR = 2012;
module.exports.DATA_START_MONTH = 0; 

module.exports.DATA_END_YEAR = 2015;
module.exports.DATA_END_MONTH = 8;

module.exports.DATA_END_MOMENT = moment([module.exports.DATA_END_YEAR, module.exports.DATA_END_MONTH, 1]); 

module.exports.disableLabels = ['BIH', 'MKD', 'ALB', 'LUX', 'MNE', 'ARM', 'AZE', 'LBN'];
