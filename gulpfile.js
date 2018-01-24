
var gulp = require('gulp');

var opts = {
  paths: ['node_modules/lucify-commons'],
  publishFromFolder: 'dist',
  pageDef: {
    title: 'The Flow Towards Europe - Lucify'
  },
  assetContext: process.env.MINARD ? '' : 'embed/the-flow-towards-europe-updating/'
};

var builder = require('lucify-component-builder');
builder(gulp, opts);
