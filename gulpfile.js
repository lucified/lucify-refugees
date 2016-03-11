
var gulp = require('gulp');

var opts = {
  paths: ['node_modules/lucify-commons'],
  publishFromFolder: 'dist',
  assetContext: 'embed/the-flow-towards-europe-updating/'
};

var builder = require('lucify-component-builder');
builder(gulp, opts);
