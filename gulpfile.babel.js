
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
	paths: ['node_modules/lucify-commons']
}

var taskCreator = require('lucify-embed');
taskCreator(gulp, opts);
