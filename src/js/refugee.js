
var moment = require('moment');
var Vec2 = require('vec2');

// single refugee
var Refugee = function(startPoint, endPoint, speed, endMoment, hasEUDestination) {
	this.startPoint = startPoint;
	this.endPoint = endPoint;
	this.speed = speed;
	this.endMoment = endMoment;
	this.hasEUDestination = hasEUDestination;
	this.started = false;
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


Refugee.prototype.getTravelTime = function(r) {
	return this.getTravelDistance(r) / this.speed;
}

Refugee.prototype.isActive = function() {
	return this.started && !this.arrived;
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

	if (mom.unix() > this.endMoment.unix()) {
		r.arrived = true;

		this.onFinished.forEach(function(f) {
			f(this);
		})

		return r.endPoint;
	}

	var directionVector = Vec2(
			r.startPoint[0] - r.endPoint[0],
			r.startPoint[1] - r.endPoint[1])
		.normalize();

	var hours = this.getStartMoment().diff(mom, 'hours');
	var distance = hours * r.speed;

	var v = Vec2(r.startPoint);
	v.add(directionVector.multiply(distance / 111));
	return v.toArray();
}


module.exports = Refugee;
