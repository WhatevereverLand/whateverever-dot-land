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
var mocha = require('gulp-mocha');

var options = {
	stylusFiles: './stylus/**/*',
	cssConcatName: 'jquery.ui.colorpicker.css',
	javascriptFiles: './javascript/**/*',
	javascriptConcatName: 'jquery.ui.colorpicker.js',
	partialFiles: './partials/**/*',
	unitTestConfig: './test/test-options.js',
	unitTestFiles: './test/unit/**/*',
	index: 'index.html',
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

// Only development version for now. May browserify them later but may just
// leave them to be separate
function buildPartials() {
	gulp.src(options.partialFiles)
		.pipe(gulp.dest(options.distPath + '/partials'));
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
	runUnitTests();	
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

function notifyGulpfileChange() {
	// Can you handle the meta!?
	gulp.watch(options.gulpfile, projectChanged);
}

function notifyPartialsChange() {
	gulp.watch(options.partialFiles, projectChanged);
}

// NOTE: This is a target that doesn't work with just livereload
function notifyUnitTestsChange() {
	gulp.watch([options.unitTestConfig, options.unitTestFiles], function handleUnitTestChange() {
		runUnitTests();
		projectChanged(arguments);
	});
}

function notifyIndexChange() {
	gulp.watch(options.index, function handleIndexChange() {
		buildIndex();
		projectChanged();
	});
}

function runUnitTests() {
	gulp.src(options.unitTestFiles, {'read': false})
		.pipe(mocha({
			'reporter': 'nyan',
			'ui': 'bdd'
		}))
		.on('error', function handleUnitTestError(err) {
			// Mocha will let us know what's up
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

gulp.task('build-partials', buildPartials);
gulp.task('build-index', buildIndex);

gulp.task('build-development', [
	'build-javascript-development',
	'build-css-development',
	'build-partials',
	'build-index'
]);

gulp.task('build', [
	'build-javascript-production',
	'build-css-production',
	'build-partials',
	'build-index'
]);

/**
 * Tie watches together
 */
gulp.task('watch-stylus', notifyStylusChange);
gulp.task('watch-readme', notifyReadmeChange);
gulp.task('watch-gulpfile', notifyGulpfileChange);
gulp.task('watch-partials', notifyPartialsChange);
gulp.task('watch-index', notifyIndexChange);
gulp.task('watch-unit-test', notifyUnitTestsChange);
gulp.task('watch-startListener', startListener);

gulp.task('unit-test', runUnitTests);

gulp.task('serve', serve);

gulp.task('watch', [
	//'watch-unit-test',
	'watch-stylus',
	'watch-readme',
	'watch-partials',
	'watch-index',
	'watch-startListener',
	//'unit-test',
	'serve'
]);

/**
 * Utility stuff
 */
gulp.task('clean', cleanDist);

gulp.task('help', help);
gulp.task('default', ['help']);
