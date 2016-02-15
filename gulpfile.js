// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var beautify = require('gulp-jsbeautifier');

// CSS
gulp.task('css', function() {
	return gulp.src('scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('css'));
});

// JS
gulp.task('jsLint', function() {
	return gulp.src(['*.js', 'js/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});
gulp.task('jsBeautify', function() {
	gulp.src(['*.js', 'js/*.js'])
		.pipe(beautify({
			js: {
				indentSize: 1,
				indentWithTabs: true,
				jslintHappy: false
			}
		}))
		.pipe(gulp.dest('.'));
});
gulp.task('jsUglify', function() {
	return gulp.src(['*.js', 'js/*.js'])
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist'))
		.pipe(rename('all.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watching', function() {
	gulp.watch(['*.js', 'js/*.js'], ['jsLint', 'jsBeautify']);
	gulp.watch('scss/*.scss', ['css']);
});

gulp.task('default', ['jsLint', 'jsBeautify', 'css']);
gulp.task('watch', ['jsLint', 'jsBeautify', 'css', 'watching']);
