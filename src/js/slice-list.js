



var SliceList = function() {}



SliceList.prototype.add = function(start, end, item) {

	this.dirty = true;
}


SliceList.prototype.prepare = function() {

	
	this.dirty = false;
}


SliceList.prototype.count = function(start, end) {
	if (this.dirty === true) {
		this.prepare();
	}
}


SliceList.prototype.itemAt = function(value) {

}


SliceList.prototype.forEach = function(start, end, func) {

}




var findNearest = function (v, steps) {
	var len = steps.length,
		lindex = 0,
		hindex = len-1,
		mindex = (lindex + hindex) >> 1;
	if (!len) {return 0; }
	while (lindex < hindex) {
		mindex = (lindex + hindex) >> 1;
		if (v < steps[mindex]) {
			hindex = mindex;
		} else if (v > steps[mindex]) {
			lindex = mindex;
		} else {
			return steps[mindex];
		}
		if(lindex == hindex-1){
			return v-steps[lindex] < steps[hindex]-v ? steps[lindex] : steps[hindex];
		}	
	}		
}



module.exports = SliceList;