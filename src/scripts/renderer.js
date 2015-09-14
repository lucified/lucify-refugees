


var sprintf = require('sprintf');

var page = require('webpage').create();
page.viewportSize = { width: 1920, height: 1080 };

page.open('http://localhost:3000/?divider=5&autostart=false&hd=true', function () {
  setTimeout(function() { 

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



