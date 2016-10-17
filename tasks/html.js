'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

function html(options) {

  return function() {
    return gulp.src(options.src, {since: gulp.lastRun(html)})
      .pipe($.newer(options.build))
      .pipe($.debug({
        title: 'html'
      }))
      .pipe(gulp.dest(options.build));
  };

}

module.exports = html;
