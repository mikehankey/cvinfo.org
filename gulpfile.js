const { src, dest, parallel } = require('gulp'); 
const minifyCSS = require('gulp-csso');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
 

function css() {
  return src('src/sass/*.scss')
    .pipe(sass())
    .pipe(minifyCSS())
    .pipe(dest('dist/css'))
}

function js() {
  return src('src/js/*.js', { sourcemaps: true })
    .pipe(concat('cvinfo.min.js'))
    .pipe(dest('dist/js', { sourcemaps: true }))
}

exports.js = js;
exports.css = css; 
exports.default = parallel(css, js);