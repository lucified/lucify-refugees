
var moment = require('moment');

// note that month indices are zero-based

module.exports.DATA_START_YEAR = 2012;
module.exports.DATA_START_MONTH = 0;

module.exports.DATA_END_YEAR = 2017;
module.exports.DATA_END_MONTH = 11;

module.exports.DATA_END_MOMENT = moment([
  module.exports.DATA_END_YEAR,
  module.exports.DATA_END_MONTH]).endOf('month');

module.exports.ASYLUM_APPLICANTS_DATA_UPDATED_MOMENT = moment([2018, 1, 7]);

module.exports.disableLabels = ['BIH', 'MKD', 'ALB', 'LUX', 'MNE', 'ARM', 'AZE', 'LBN'];

module.exports.labelShowBreakPoint = 992;
