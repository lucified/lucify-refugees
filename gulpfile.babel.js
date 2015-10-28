
var gulp = require('gulp');
var execsyncs = require('gulp-execsyncs');


gulp.task('prepare-data', function(cb) {
  execsyncs({
    cmds : [
      './prepare.sh'
      ]
  });
  cb();
});


var opts = {
	pretasks: ['prepare-data'],
	paths: ['node_modules/lucify-commons'],
	publishFromFolder: 'dist',
	defaultBucket: 'lucify-dev',
	maxAge: 3600,
	assetContext: 'embed/the-flow-towards-europe/',
	baseUrl: 'http://www.lucify.com/'
}

var builder = require('lucify-component-builder');
builder(gulp, opts);
