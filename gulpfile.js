const gulp = require('gulp');
const minify = require('gulp-minify');
const cleanCss = require('gulp-clean-css');
const del = require('del');
const hashsum = require('gulp-hashsum');

gulp.task('clean-js', () => del([
  './public/js/utility.js',
  './public/js/dataHelper.js',
  './public/js/playerControl.js',
  './public/js/uiControl.js',
  './public/js/dashControl.js',
  './public/sums.json',
]));

gulp.task('clean-css', () => del([
  './public/css/styles.css',
]));

gulp.task('pack-js', () => gulp.src([
  'assets/js/utility.js',
  'assets/js/dataHelper.js',
  'assets/js/playerControl.js',
  'assets/js/uiControl.js',
  'assets/js/dashControl.js',
])
  .pipe(minify({
    ext: {
      min: '.js',
    },
    noSource: true,
  }))
  .pipe(gulp.dest('public/js')));

gulp.task('pack-css', () => gulp.src(['./assets/css/*.css'])
  .pipe(cleanCss())
  .pipe(gulp.dest('./public/css')));

gulp.task('hash', () => gulp.src(['public/js/**/*.js', 'public/css/**/*.css', 'public/img/**', 'public/sw.js'])
  .pipe(hashsum({
    dest: 'public',
    json: true,
    force: true,
    filename: 'sums.json',
  })));

gulp.task('default', gulp.series('clean-js', 'clean-css', 'pack-css', 'pack-js'));

gulp.task('default-hash', gulp.series('default', 'hash'));
