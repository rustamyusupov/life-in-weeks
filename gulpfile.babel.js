'use strict';

const transfer = false;

const gulp = require('gulp');
const browserSync = require('browser-sync').create();

const paths = {
  src: {
    fonts: 'src/fonts/*.*',
    img: 'src/img/*.{png,jpg,gif,svg}',
    svg: 'src/img/*.svg',
    js: 'src/js/script.js',
    styles: 'src/sass/style.scss',
    html: 'src/*.html',
    extra: 'src/*.{php,ico}'
  },
  build: {
    fonts: 'build/fonts/',
    img: 'build/img/',
    js: 'build/js/',
    css: 'build/css/',
    html: 'build/'
  },
  watch: {
    fonts: 'src/fonts/*.*',
    img: 'src/img/*.*',
    js: 'src/js/**/*.js',
    styles: 'src/sass/**/*.scss',
    html: 'src/**/*.html',
    extra: 'src/**/*.{php,ico}'
  },
  clean: 'build/**/*',
  deploy: 'build/**/*'
};

const config = {
  server: './build',
  host: 'localhost',
  port: 3000,
  open: false
};

function lazyRequireTask(name, path, options) {
  options = options || {};
  options.name = name;

  gulp.task(name, function(callback) {
    let task = require(path).call(this, options);

    return task(callback);
  });
}

lazyRequireTask('fonts', './tasks/fonts', {
  src: paths.src.fonts,
  build: paths.build.fonts
});

lazyRequireTask('images', './tasks/images', {
  src: paths.src.img,
  build: paths.build.img
});

lazyRequireTask('svg', './tasks/svg', {
  src: paths.src.svg,
  build: paths.build.img
});

lazyRequireTask('js', './tasks/scripts', {
  src: paths.src.js,
  build: paths.build.js,
  transfer: transfer
});

lazyRequireTask('extra', './tasks/extra', {
  src: paths.src.extra,
  build: paths.build.html
});

lazyRequireTask('styles', './tasks/styles', {
  src: paths.src.styles,
  build: paths.build.css,
  transfer: transfer
});

lazyRequireTask('html', './tasks/html', {
  src: paths.src.html,
  build: paths.build.html
});

lazyRequireTask('clean', './tasks/clean', {
  src: paths.clean
});

lazyRequireTask('ghpages', './tasks/ghpages', {
  src: paths.deploy
});

function watch() {
  gulp.watch(paths.watch.fonts, gulp.series('fonts'));
  gulp.watch(paths.watch.img, gulp.series('images', 'svg'));
  gulp.watch(paths.watch.js, gulp.series('js'));
  gulp.watch(paths.watch.php, gulp.series('extra'));
  gulp.watch(paths.watch.styles, gulp.series('styles'));
  gulp.watch(paths.watch.html, gulp.series('html'));
}

function serve() {
  browserSync.init(config);

  browserSync.watch('build/**/*.*').on('change', browserSync.reload);
}

exports.watch = watch;
exports.serve = serve;

let build = gulp.series('clean', gulp.parallel('fonts', 'images', 'styles', 'js', 'extra'), 'svg', 'html');
let deploy = gulp.series('ghpages');

gulp.task('build', build);
gulp.task('deploy', deploy);
gulp.task('default', gulp.series(build, gulp.parallel(watch, serve)));
