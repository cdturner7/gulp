let gulp = require('gulp');
let rename = require('gulp-rename');
let sass = require('gulp-sass')(require('sass'));
let uglify = require('gulp-uglify');
let autoprefixer = require('gulp-autoprefixer');
let sourcemaps = require('gulp-sourcemaps');
let browserify = require('browserify');
let babelify = require('babelify');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');

// define the source files for the stylesheets
let styleSRC   = 'src/scss/style.scss';
let styleDIST  = './dist/css/';
let styleWatch = 'src/scss/**/*.scss'

// define the source files for javascript files
let jsSRC    = 'script.js';
let jsFolder = 'src/js/';
let jsDIST   = './dist/js/';
let jsWatch  = 'src/js/**/*.js';
let jsFiles  = [jsSRC];

// gulp task to compile and update the CSS from sass files
function styles(done) {
    // compile scss
    gulp.src(styleSRC)
        .pipe(sourcemaps.init())
        .pipe(sass({
            errorLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .on('error', console.error.bind(console))
        .pipe(autoprefixer({cascade: false}))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(styleDIST));
    // signal done with calling callback function.. 
    // nothing to do though
    done();
}

// gulp task to update the js files
function scripts(done) {
    jsFiles.map(function(entry) {
        return browserify({
            entries: [jsFolder + entry]
        })
        .transform(babelify, {
            presets: ["@babel/preset-env"]
        })
        .bundle()
        .pipe(source(entry))
        .pipe(rename({extname: '.min.js'}))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps:true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(jsDIST))
    });
    // signal done with calling callback function.. 
    // nothing to do though
    done();
}

// you can use CommonJS `exports` module notation to declare tasks
exports.styles = styles;
exports.scripts = scripts;

// define default task that can be called by just running `gulp` from cli
const build = gulp.series(gulp.parallel(styles, scripts), function() {
    gulp.watch(styleWatch, gulp.series(styles));
    gulp.watch(jsWatch, gulp.series(scripts));
});
exports.default = build;