'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

function extra(options) {

  return function() {
    return gulp.src(options.src, {since: gulp.lastRun(extra)})
      .pipe($.newer(options.build))
      .pipe($.debug({
        title: 'extra'
      }))
      .pipe(gulp.dest(options.build));
  };

}

module.exports = extra;
