'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

function svg(options) {

  return function() {
    return gulp.src(options.src)
      .pipe($.debug({title: 'svg'}))
      .pipe($.svgmin(function(file) {
        return {
          plugins: [{
            cleanupIDs: {
              minify: true
            }
          }]
        }
      }))
      .pipe($.svgstore({ inlineSvg: true }))
      .pipe($.cheerio(function($) {
        $('svg').attr('style',  'display:none');
      }))
      .pipe($.rename('sprite.svg'))
      .pipe(gulp.dest(options.build));
  };

}

module.exports = svg;
