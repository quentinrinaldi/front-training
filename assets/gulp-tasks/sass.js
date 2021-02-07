const gulp = require('gulp');
const config = require('../config');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const log = require('fancy-log');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');

/**
 * Generate CSS from SCSS
 * Build sourcemaps
 */
gulp.task('sass', () => {

  return gulp.src(config.paths.styles.src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({errLogToConsole: true}).on('error', function(err){
      log.error(err.message);
    }))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.paths.styles.dest));
});
