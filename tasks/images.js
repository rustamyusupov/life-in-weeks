'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const pngquant = require('imagemin-pngquant');

function images(options) {

  return function() {
    return gulp.src(options.src, {since: gulp.lastRun(images)})
      .pipe($.newer(options.build))
      .pipe($.debug({
        title: 'images'
      }))
      .pipe($.imagemin({
        progressive: true,
        use: [pngquant()]
      }))
      .pipe(gulp.dest(options.build));
  };

}

module.exports = images;
