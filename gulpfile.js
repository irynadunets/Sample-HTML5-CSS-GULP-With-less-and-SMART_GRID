const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
var del = require('del');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
let cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var gulpif = require('gulp-if');
var gcmq = require('gulp-group-css-media-queries');
var less = require('gulp-less');
var smartgrid = require('smart-grid');

const isDev = (process.argv.indexOf('--dev') !== -1);
const isProd = !isDev;
const isSync = (process.argv.indexOf('--sync') !== -1);
console.log(isDev);
console.log(isProd);
function clear(){
  return del('build/*');
}

function styles(){
  return gulp.src('./src/css/style.less')
  .pipe(gulpif(isDev, sourcemaps.init()))
  .pipe(less())
  //.pipe(concat('style.css'))
  //.on('error',console.error.bind(console))
  .pipe(gcmq())
  .pipe(autoprefixer({
       overrideBrowserslist: ['>0.1%'],
       cascade: false
   }))
      .pipe(gulpif(isProd, cleanCSS({
        level: 2
      })))
      .pipe(gulpif(isDev,sourcemaps.write()))
      .pipe(gulp.dest('./build/css'))
      .pipe(gulpif(isSync, browserSync.stream()));
}

function img(){
  return gulp.src('./src/images/**/*')
      .pipe(gulp.dest('./build/images'));
}

function html(){
  return gulp.src('./src/*.html')
      .pipe(gulp.dest('./build'))
      .pipe(gulpif(isSync, browserSync.stream()));
}

function watch(){
  browserSync.init({
      server: {
          baseDir: "./build"
      }
  });

  gulp.watch('./src/css/*.less',styles);
  gulp.watch('./src/*.html',html);
}

function grid(done){
  let settings ={
    outputStyle: 'less', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % || rem */
    mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1200px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            width: '1100px', /* -> @media (max-width: 1100px) */
        },
        md: {
            width: '960px'
        },
        sm: {
            width: '780px',
            fields: '15px' /* set fields only if you want to change container.fields */
        },
        xs: {
            width: '560px'
        }
  }
};
  smartgrid('./src/css',settings);
  done();
}

let build = gulp.series(clear,
  gulp.parallel(styles,img,html)
);

gulp.task('build',build);
gulp.task('watch',gulp.series(build,watch));
gulp.task('grid',grid);
