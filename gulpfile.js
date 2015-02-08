'use strict';

var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var uglifyJs = require('gulp-uglify');
var help = require('gulp-task-listing');
var stylus = require('gulp-stylus');
var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');

var options = {
	stylusFiles: './src/public/styles/**/*',
	cssConcatName: 'weel.css',
	javascriptFiles: './src/public/javascript/**/*',
	javascriptConcatName: 'weel.js',
	pageFiles: 'index.html',
	distPath: './dist',
	readme: './README.md',
	gulpfile: './gulpfile.js'
};

/**
 * Building tasks
 */
function buildCssDev() {
	gulp.src(options.stylusFiles)
		.pipe(stylus())
		.pipe(gulp.dest(options.distPath + '/css'));
}

function buildCssProduction() {
	gulp.src(options.stylusFiles)
		.pipe(stylus())
		.pipe(minifyCss())
		.pipe(concat(options.cssConcatName))
		.pipe(gulp.dest(options.distPath + '/css'));
}

function buildJavascriptDev() {
	gulp.src(options.javascriptFiles)
		.pipe(gulp.dest(options.distPath + '/javascript'));
}

function buildJavascriptProduction() {
	gulp.src(options.javascriptFiles)
		.pipe(uglifyJs())
		.pipe(concat(options.javascriptConcatName))
		.pipe(gulp.dest(options.distPath + '/javascript'));
}

function buildIndex() {
	gulp.src(options.index)
		.pipe(gulp.dest(options.distPath));
}

function cleanDist() {
	gulp.src(options.distPath)
		.pipe(rimraf({
			force: true
		}));
}

function projectChanged() {
	livereload.changed(arguments);
}

/**
 * Serve target for debug version
 */
function serve() {
	nodemon({
		script: 'src/server/app.js'
	});
}
/**
 * Live reload setup
 */
function notifyStylusChange() {
	gulp.watch(options.stylusFiles, projectChanged);
}

function notifyReadmeChange() {
	gulp.watch(options.readme, projectChanged);
}

function notifyPartialsChange() {
	gulp.watch(options.partialFiles, projectChanged);
}

function notifyPagesChange() {
	gulp.watch(options.index, function handlePagesChange() {
		buildPages();
		projectChanged();
	});
}

function startListener() {
	livereload.listen();
}

/**
 * Tie builds together
 */
gulp.task('build-javascript-development', buildJavascriptDev);
gulp.task('build-javascript-production', buildJavascriptProduction);

gulp.task('build-javascript', [
	'build-javascript-development',
	'build-javascript-production'
]);

gulp.task('build-css-development', buildCssDev);
gulp.task('build-css-production', buildCssProduction);

gulp.task('build-css', [
	'build-css-development',
	'build-css-production'
]);

gulp.task('build-index', buildIndex);

gulp.task('build-development', [
	'build-javascript-development',
	'build-css-development',
	'build-index'
]);

gulp.task('build', [
	'build-javascript-production',
	'build-css-production',
	'build-index'
]);

/**
 * Tie watches together
 */
gulp.task('watch-stylus', notifyStylusChange);
gulp.task('watch-readme', notifyReadmeChange);
gulp.task('watch-pages', notifyPagesChange);
gulp.task('watch-startListener', startListener);

gulp.task('serve', serve);

gulp.task('watch', [
	'watch-stylus',
	'watch-readme',
	'watch-index',
	'watch-startListener',
	'serve'
]);

/**
 * Utility stuff
 */
gulp.task('clean', cleanDist);

gulp.task('help', help);
gulp.task('default', ['help']);
