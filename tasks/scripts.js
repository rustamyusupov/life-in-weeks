'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserify = require('browserify');
const babelify = require("babelify");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

let isDev = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

function js(options) {

  return function() {
    return browserify({
        entries: options.src,
        debug: true
      })
      .transform(babelify)
      .bundle()
      .on('error', $.notify.onError(function(err) {
        return {
          title: "browserify error",
          message: err.message
        }
      }))
      .pipe(source('script.js'))
      .pipe(buffer())
      .pipe($.debug({
        title: 'js'
      }))
      .pipe($.if(isDev, $.sourcemaps.init({loadMaps: true})))
      .pipe($.if(options.transfer, gulp.dest(options.build)))
      .pipe($.if(!isDev, $.uglify()))
      .pipe($.rename('script.min.js'))
      .pipe($.if(isDev, $.sourcemaps.write()))
      .pipe(gulp.dest(options.build));
  };

}

module.exports = js;
