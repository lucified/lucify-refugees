
var console = require("console-browserify")


var RefugeePointsModel = function(refugees, randomStartPoint, smartSpreadEnabled) {
	
  this.randomStartPoint = randomStartPoint;
  this.smartSpreadEnabled = smartSpreadEnabled;

  this.refugees = refugees;
	this.activeRefugees = [];
	this.stamp = 0;
	this.refugeeIndex = 0;
	this.refugeesOnPath = {};

	console.time("refugee sorting");
  	this.refugees.sort(function(a, b) {
    	return a.startMomentUnix - b.startMomentUnix;
  	});
  	console.timeEnd("refugee sorting");
}


// Public API
// ----------

RefugeePointsModel.prototype.getNumRefugeesOnPath = function(startCountry, endCountry, stamp) {
	this._moveToStamp(stamp);
	return this.refugeesOnPath[startCountry][endCountry].length;
}


RefugeePointsModel.prototype.forEachActiveRefugee = function(stamp, func) {
	this._moveToStamp(stamp);
  var length = this.activeRefugees.length;
  for (var i = 0; i < length; i++) {
      func(this.activeRefugees[i]);
  }
}


// Private functions
// -----------------

RefugeePointsModel.prototype._update = function(newStamp) {
	if (newStamp > this.stamp) {
		this._updateForward(newStamp);
	} else {
		this._updateBackward(newStamp);	
	}
	this.stamp = newStamp;	
}


// Moving backwards not that efficient
// as it will iterate through the whole array of refugees
RefugeePointsModel.prototype._updateBackward = function(stamp) {
	//console.log("update backward");

	this.activeRefugees = this.refugees.filter(function(r) {
		return r.startMomentUnix < stamp && r.endMomentUnix > stamp;
	});

	var latestStamp = 0;
	var latestRefugee;
	this.refugeesOnPath = {};
	this.activeRefugees.forEach(function(r) {
      	r.setRouteRefugeeCount(this._increaseRefugeeEnRoute(r.originCountry, r.destinationCountry));
		
      	if (r.startMomentUnix > latestStamp) {
      		latestStamp = r.startMomentUnix;
      		latestRefugee = r;
      	}
		latestStamp = Math.max(latestStamp, r.startMomentUnix);
	}.bind(this));

	this.refugeeIndex = this.refugees.indexOf(latestRefugee);
}


// Moving forwards is efficient
RefugeePointsModel.prototype._updateForward = function(stamp) {
  var r;

  //console.log("update forward" + stamp);

  // add new ones
  while ((r = this.refugees[this.refugeeIndex]) != null && r.startMomentUnix < stamp) {
    if (this.smartSpreadEnabled) {
      r.setRouteRefugeeCount(this._increaseRefugeeEnRoute(r.originCountry, r.destinationCountry));
    }
    this.activeRefugees.push(r);
    this.refugeeIndex++;
    //this.onRefugeeStarted(r);
  }

  // update current ones
  var stillActive = [];
  var length = this.activeRefugees.length;

  for (var i = 0; i < length; i++) {
    r = this.activeRefugees[i];
    if (r.endMomentUnix < stamp) {
      if (this.smartSpreadEnabled) {
        this.refugeesOnPath[r.originCountry][r.destinationCountry]--;
      }
    } else {
      stillActive.push(r);
    }
  }

  this.activeRefugees = stillActive;
};



RefugeePointsModel.prototype._increaseRefugeeEnRoute = function(start, end) {
  if (!(start in this.refugeesOnPath)) {
    this.refugeesOnPath[start] = {};
  }
  if (!(end in this.refugeesOnPath[start])) {
    this.refugeesOnPath[start][end] = 1;
  } else {
    this.refugeesOnPath[start][end]++;
  }

  return this.refugeesOnPath[start][end];
};



RefugeePointsModel.prototype._moveToStamp = function(stamp) {
	if (this.stamp !== stamp) {
		this._update(stamp);
	}
}


module.exports = RefugeePointsModel;

