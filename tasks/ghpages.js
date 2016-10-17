'use strict';

const gulp = require('gulp');
const ghPages = require('gulp-gh-pages');

function ghpages(options) {

  return function() {
    return gulp.src(options.src)
      .pipe(ghPages());
  };

}

module.exports = ghpages;
