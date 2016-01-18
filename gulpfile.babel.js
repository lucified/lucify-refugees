
var gulp = require('gulp');

var opts = {
	paths: ['node_modules/lucify-commons'],
	publishFromFolder: 'dist',
	defaultBucket: 'lucify-dev',
	maxAge: 3600,
	assetContext: 'embed/the-flow-towards-europe-updating/',
	baseUrl: 'http://www.lucify.com/'
}

var builder = require('lucify-component-builder');
builder(gulp, opts);
