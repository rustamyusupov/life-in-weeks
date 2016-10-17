'use strict';

const del = require('del');

function clean(options) {

  return function() {
    return del(options.src);
  };

}

module.exports = clean;
