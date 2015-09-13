
var moment = require('moment');
var Vec2 = require('vec2');
var randgen = require('randgen');

// single refugee
var Refugee = function(startPoint, endPoint, destinationCountry, speed, endMoment) {
	this.startPoint = startPoint;
	this.endPoint = endPoint;
	this.destinationCountry = destinationCountry;
	this.speed = speed;
	this.endMoment = endMoment;
	if (window.SMART_SPREAD_ENABLED) {
		this.sideDeviation = randgen.rnorm(0, 1); // mean, std. deviation
		this.maxSideDeviation = 0.3;
	}
	this.arrived = false;

	this.startMoment = this._getStartMoment();
	this.startMomentUnix = this.startMoment.unix();
	this.endMomentUnix = this.endMoment.unix();

	this.onFinished = [];
};


Refugee.prototype.getStartMoment = function() {
	return this.startMoment;
}

Refugee.prototype._getStartMoment = function() {
	var ret = moment(this.endMoment);
	return ret.subtract(this.getTravelTime(), 'hours');
}

Refugee.prototype.setRouteRefugeeCount = function(count) {
	this.maxSideDeviation = Math.max(0.3, count / 3000);
}

Refugee.prototype.getTravelTime = function(r) {
	return this.getTravelDistance(r) / this.speed;
}

/*
 * Get the distance travelled by the given
 * refugee in kilometers
 */
Refugee.prototype.getTravelDistance = function() {
	var degLength = Vec2(
		this.endPoint[0] - this.startPoint[0],
		this.startPoint[1] - this.endPoint[1]).length();

	return degLength * 111;
}


Refugee.prototype.isPastStartMoment = function(mom) {
	return mom.unix() > this.getStartMoment().unix();
}


Refugee.prototype.getLocation = function(mom) {
	var r = this;

	//if (mom.unix() < this.getStartMoment().unix()) {
	//	return r.startPoint;
	//}

	if (mom.unix() > this.endMomentUnix) {
		if (!r.arrived) {
			r.arrived = true;

			this.onFinished.forEach(function(f) {
				f(r);
			});
		}

		return r.endPoint;
	}

	var hours = this.getStartMoment().diff(mom, 'hours');
	var distance = hours * r.speed;
	var directionVector = Vec2(
			r.startPoint[0] - r.endPoint[0],
			r.startPoint[1] - r.endPoint[1])
		.normalize();

	if (window.SMART_SPREAD_ENABLED) {
		var sideMotionVector = Vec2(-directionVector.y, directionVector.x); // perpendicular vector
		var portionOfJourney = hours / this.getTravelTime();
	}

	var v = Vec2(r.startPoint);
	v.add(directionVector.multiply(distance / 111));

	if (window.SMART_SPREAD_ENABLED) {
		sideMotionVector.multiply(Math.sin(portionOfJourney * Math.PI) * this.sideDeviation * this.maxSideDeviation);
		v.add(sideMotionVector);
	}

	return v.toArray();
}


module.exports = Refugee;
