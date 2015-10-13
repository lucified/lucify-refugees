
//
// Phantomjs script for rendering a video of the map
// 
// this is currently broken
//

var sprintf = require('sprintf');

var page = require('webpage').create();
page.viewportSize = { width: 1920, height: 1080 };

page.open('http://localhost:3000/?divider=5&autostart=false&hd=true', function () {
  setTimeout(function() { 

    // 32135 frames should be enough for
    // 1.1.2012 - 1.9.2015
    // 1 second per frame
    
    // 32135 / 60 = 22 hours of rendering time
    // 32135 / 25 / 60 = 21 min video 
    //  => 10 mins with speedup
    //     that is reasonable
    //

    // but actually there is data to show only
    // until about 6/2015
    // so it is about 30000 frames

  	var frames = 40;
  	for (var i = 1; i <= frames; i++) {
		page.evaluate(function() {
    		//console.log("Frame " + i + "/" + frames);
    		tick();
  		});
  		page.render('/dev/stdout', { format: "png" });
    	//page.render('frames/image' + sprintf("%05d", i) + '.png', { format: "png" });
  	}

    phantom.exit();
  }, 666);
});



// code from the original main.js used to support
// video rendering

// var tick = function() {
//   refugeeModel.currentMoment.add(1, 'hours');
//   d3.select('#time')
//     .text(refugeeModel.currentMoment.format('DD.MM.YYYY'));
//   refugeeModel.update();
//   refugeeMap.update();
// };

// // only for testing
// var tick100 = function() {
//   _.range(0, 100).forEach(tick);
// };

// window.tick = tick;
// window.tick100 = tick100;