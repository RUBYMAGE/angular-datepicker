//load plugins
var gulp = require('gulp'),
    compass = require('gulp-compass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    path = require('path');

//the title and icon that will be used for the Grunt notifications
var notifyInfo = {
    title: 'Gulp',
    icon: path.join(__dirname, 'gulp.png')
};

//error notification settings for plumber
var plumberErrorHandler = {
    errorHandler: notify.onError({
        title: notifyInfo.title,
        icon: notifyInfo.icon,
        message: "Error: <%= error.message %>"
    })
};

//styles
gulp.task('styles', function () {
    return gulp.src(['src/sass/rm-datepicker.scss'])
        .pipe(plumber(plumberErrorHandler))
        .pipe(compass({
            css: 'dist',
            sass: 'src/sass',
            image: 'dist'
        }))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss({processImport: false}))
        .pipe(gulp.dest('dist'));
});

//scripts
gulp.task('scripts', function () {
    return gulp.src('src/scripts/rm-datepicker.js')
        .pipe(plumber(plumberErrorHandler))
        //.pipe(concat('main.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({preserveComments: "license"}))
        .pipe(gulp.dest('dist'));
});

//watch
gulp.task('live', function () {
    livereload.listen();

    //watch .scss files
    gulp.watch('src/sass/**/*.scss', ['styles']);

    //watch .js files
    gulp.watch('src/scripts/**/*.js', ['scripts']);

    //reload when a template file, the minified css, or the minified js file changes
    gulp.watch('index.html', 'dist/rm-datepicker.min.css', 'dist/rm-datepicker.min.js', function (event) {
        gulp.src(event.path)
            .pipe(plumber())
            .pipe(livereload())
            .pipe(notify({
                title: notifyInfo.title,
                icon: notifyInfo.icon,
                message: event.path.replace(__dirname, '').replace(/\\/g, '/') + ' was ' + event.type + ' and reloaded'
            })
        );
    });
});