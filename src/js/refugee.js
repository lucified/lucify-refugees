
var moment = require('moment');
var Vec2 = require('vec2');
var randgen = require('randgen');

var KILOMETERS_PER_DEGREE = 111;

// single refugee
var Refugee = function(startPoint, endPoint, destinationCountry, speed, endMoment, isAsylumSeeker) {
  this.startPoint = startPoint;
  this.endPoint = endPoint;
  this.destinationCountry = destinationCountry;
  this.speed = speed;
  this.endMoment = endMoment;
  this.isAsylumSeeker = isAsylumSeeker;
  this.totalTravelTime = this.getTravelDistance() / this.speed;

  if (window.SMART_SPREAD_ENABLED) {
    this.sideDeviation = randgen.rnorm(0, 1); // mean, std. deviation
    this.maxSideDeviation = 0.3;
  }
  this.arrived = false;

  this.startMoment = this._getStartMoment();
  this.startMomentUnix = this.startMoment.unix();
  this.endMomentUnix = this.endMoment.unix();

  this.directionVector = Vec2(
    this.startPoint[0] - this.endPoint[0],
    this.startPoint[1] - this.endPoint[1])
      .normalize();
};


Refugee.prototype.getStartMoment = function() {
  return this.startMoment;
};


Refugee.prototype._getStartMoment = function() {
  var ret = moment(this.endMoment);
  return ret.subtract(this.getTravelTime(), 'hours');
};


Refugee.prototype.setRouteRefugeeCount = function(count) {
  this.maxSideDeviation = Math.min(Math.max(0.3, count / 3000), 1.0);
};


Refugee.prototype.getTravelTime = function() {
  return this.totalTravelTime;
};


/*
 * Get the distance travelled by the given
 * refugee in kilometers
 */
Refugee.prototype.getTravelDistance = function() {
  var x = this.endPoint[0] - this.startPoint[0];
  var y = this.startPoint[1] - this.endPoint[1];
  return Math.sqrt(x*x + y*y) * KILOMETERS_PER_DEGREE;
};


Refugee.prototype.isPastStartMoment = function(mom) {
  return mom.unix() > this.getStartMoment().unix();
};


Refugee.prototype.update = function(mom) {
  var r = this;

  if (mom.unix() > this.endMomentUnix) {
    r.arrived = true;
    this.location = r.endPoint;
    return;
  }

  var hours = this.getStartMoment().diff(mom) / (1000 * 60 * 60);
  var distance = hours * r.speed;
  var v = Vec2(r.startPoint);
  v.add(this.directionVector.multiply(distance / KILOMETERS_PER_DEGREE, true));

  if (window.SMART_SPREAD_ENABLED) {
    var sideMotionVector = Vec2(-this.directionVector.y, this.directionVector.x); // perpendicular vector
    var portionOfJourney = hours / this.getTravelTime();
    sideMotionVector.multiply(
      Math.sin(portionOfJourney * Math.PI) * this.sideDeviation * this.maxSideDeviation);
    v.add(sideMotionVector);
  }

  this.location = v.toArray();
};


module.exports = Refugee;
