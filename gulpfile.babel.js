
var gulp = require('gulp');
var execsyncs = require('gulp-execsyncs');


gulp.task('prepare-data', function(cb) {
  execsyncs({
    cmds : [
      './prepare.sh',
      'src/scripts/prepare-asylum-data.rb'
      ]
  });
  cb();
});


var opts = {
	pretasks: ['prepare-data'],
	paths: ['node_modules/lucify-commons'],
	publishFromFolder: 'dist',
	defaultBucket: 'lucify-prod',
	maxAge: 60,
	assetContext: 'embed/the-flow-towards-europe/',
	baseUrl: 'http://www.lucify.com/'
}

var builder = require('lucify-component-builder');
builder(gulp, opts);
