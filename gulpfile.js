var browserSync  = require('browser-sync');
var watchify     = require('watchify');
var browserify   = require('browserify');
var source       = require('vinyl-source-stream');
var gulp         = require('gulp');
var gutil        = require('gulp-util');
var gulpSequence = require('gulp-sequence');
var processhtml  = require('gulp-minify-html');
var sass         = require('gulp-sass');
var watch        = require('gulp-watch');
var minifycss    = require('gulp-minify-css');
var uglify       = require('gulp-uglify');
var streamify    = require('gulp-streamify');
var shell        = require('gulp-shell');
var connect      = require('gulp-connect');
var prod         = gutil.env.prod;
var babelify     = require('babelify');

var execsyncs = require('gulp-execsyncs');


var onError = function(err) {
  console.log(err.message);
  this.emit('end');
};

// bundling js with browserify and watchify

var config = {
  cache: {},
  packageCache: {},
  fullPaths: true
}

var b = watchify(
  browserify('./src/js/main', config)
    .transform(babelify.configure({stage: 1})));

gulp.task('js', bundle);
b.on('update', bundle);
b.on('log', gutil.log);


function bundle() {
  return b.bundle()
    .on('error', onError)
    .pipe(source('bundle.js'))
    .pipe(prod ? streamify(uglify()) : gutil.noop())
    .pipe(gulp.dest('./build/js'))
    .pipe(browserSync.stream());
}

// html
gulp.task('html', function() {
  return gulp.src('./src/templates/**/*')
    .pipe(processhtml())
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
});

// sass
gulp.task('sass', function() {
  return gulp.src('./src/scss/app.scss')
    .pipe(sass({
      includePaths: require('node-bourbon').includePaths
    }))
    .on('error', onError)
    .pipe(prod ? minifycss() : gutil.noop())
    .pipe(gulp.dest('./build/stylesheets'))
    .pipe(browserSync.stream());
});


// gulp.task('prepare-data', shell.task([
//   './prepare.sh',
//   'node src/scripts/prepare-asylum-data.js']));

gulp.task('prepare-data', function() {
  execsyncs({
    cmds : [
      './prepare.sh',
      'src/scripts/prepare-asylum-data.rb',
      'src/scripts/prepare-regional-data.rb'
      ]
  });
});


gulp.task('img', function() {
  return gulp.src('./src/img/**/*')
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream())
});


gulp.task('data', function() {
  return gulp.src('./data/**/*.json')
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream())
});


// browser sync server for live reload
gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: './build'
    }
  });
  gulp.watch('./data', ['data']);
  gulp.watch('./src/templates/**/*', ['html']);
  gulp.watch('./src/scss/**/*.scss', ['sass']);
});

gulp.task('serveprod', function() {
  connect.server({
    root: './build',
    port: process.env.PORT || 5000, // localhost:5000
    livereload: false
  });
});

// use gulp-sequence to finish building html, sass and js before first page load
gulp.task('default', gulpSequence(['html', 'img', 'sass', 'js', 'prepare-data', 'data'], 'serve'));
gulp.task('production', gulpSequence(['html', 'img', 'sass', 'js', 'prepare-data', 'data'], 'serveprod'));
