
function daysInMonth(month,year) {
  return new Date(year, month + 1, 0).getDate();
}

function kmhToDegsPerH(kmh) {
  return kmh / 111;
}

module.exports.daysInMonth = daysInMonth;
module.exports.kmhToDegsPerH = kmhToDegsPerH;
