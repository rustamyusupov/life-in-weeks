'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sorting = require('postcss-sorting');

let isDev = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

function errorHandler(err) {
  return {
    title: 'styles compilation error',
    message: err.message
  }
}

function styles(options) {

  return function() {
    return gulp.src(options.src)
      .pipe($.debug({
        title: 'styles'
      }))
      .pipe($.if(isDev, $.sourcemaps.init()))
      .pipe($.sass({
        outputStyle: 'expanded'
      }))
      .on('error', $.notify.onError( errorHandler ))
      .pipe($.postcss([
        autoprefixer,
        mqpacker({
          sort: true
        }),
        sorting
      ]))
      .on('error', $.notify.onError( errorHandler ))
      .pipe($.if(options.transfer, gulp.dest(options.build)))
      .pipe($.if(!isDev, $.csso()))
      .pipe($.rename('style.min.css'))
      .pipe($.debug({
        title: 'rename:'
      }))
      .pipe($.if(isDev, $.sourcemaps.write()))
      .pipe(gulp.dest(options.build));
  };

}

module.exports = styles;
