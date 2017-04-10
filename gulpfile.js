const gulp = require('gulp');
const eslint = require('gulp-eslint');

const gutil = require('gulp-util');

const sass = require("gulp-sass");
const coffee = require("gulp-coffee");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const connect = require("gulp-connect");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const del = require('del');

const header = require('gulp-header');
const gitrev = require('git-rev');
const strip = require('gulp-strip-comments');

const urlExists = require('url-exists');

const browserSync = require('browser-sync').create();
const reload      = browserSync.reload;

var DIST_DIR = './dist';
var SOURCE_DIR = './source';
var TESTS_DIR = './tests';
var STYLES_DIR = SOURCE_DIR + '/css/styles';
var SCRIPTS_DIR = SOURCE_DIR + '/js/scripts';
var SCRIPT_MODULES_DIR = SCRIPTS_DIR+'/modules';
var SCRIPT_FILE_NAME = 'mobilelayer.dev.js';
var STYLE_FILE_NAME = 'mobilelayer.dev.css';
var SCRIPT_FILE = SOURCE_DIR + '/' + SCRIPT_FILE_NAME;
var STYLE_FILE = SOURCE_DIR + '/' + STYLE_FILE_NAME;

// check for JS errors
gulp.task('lint', () => {
		// ESLint ignores files with "node_modules" paths.
		// So, it's best to have gulp ignore the directory as well.
		// Also, Be sure to return the stream from the task;
		// Otherwise, the task may end before the stream has finished.
		return gulp.src([ SCRIPTS_DIR +'/**/*.js' ])
				// eslint() attaches the lint output to the "eslint" property
				// of the file object so it can be used by other modules.
				.pipe(eslint())
				// eslint.format() outputs the lint results to the console.
				// Alternatively use eslint.formatEach() (see Docs).
				.pipe(eslint.format())
				// To have the process exit with an error code (1) on
				// lint error, return the stream and pipe to failAfterError last.
				.pipe(eslint.failAfterError());
			});

/*!
 * Get Git info
 */
 var gitBranch;
 var gitHash;

 gulp.task('gitBranch', function(cb) {
	return gitrev.branch(function(str) {
		gitBranch = str;
		cb();
	});
 });

 gulp.task('gitHash', function(cb) {
	return gitrev.short(function(str) {
		gitHash = str;
		cb();
	});
 });

 gulp.task('gitInfo', ['gitBranch','gitHash'], function(cb) {
	return cb();
 });

 gulp.task('default', ['lint'], function () {
		// This will only run if the lint task is successful...
	});

/*!
 *	TASK RUNNERS
 */
gulp.task('clean-source', function() {
	gutil.log('Removing source files...');
	del(SCRIPT_FILE);
	del(STYLE_FILE);
	return true;
});

gulp.task('clean-source:js', function() {
	gutil.log('Removing source files...');
	del(SCRIPT_FILE);
	return true;
});

gulp.task('clean-source:css', function() {
	gutil.log('Removing source files...');
	del(STYLE_FILE);
	return true;
});

gulp.task('test-files-reload', function()
{
	return gulp.pipe(reload({stream: true}));
});

/*!
 *	Build JS for dev
 */
gulp.task('build-js',['clean-source:js','gitInfo'], function()
{
	gutil.log('Compiling to '+ SCRIPT_FILE);
	d = new Date(),
	headerComment = '/*!\n * Branch: ' + gitBranch + '\n * Commit: #' + gitHash + '\n * Date: ' + d +'\n */\n';
	return gulp.src( [
		SCRIPTS_DIR+'/controller.js',
		SCRIPTS_DIR+'/layer.js',
		SCRIPT_MODULES_DIR+'/**/*.js',
		SCRIPTS_DIR+'/init.js',
		] )
	.pipe(sourcemaps.init())
	.pipe(concat( SCRIPT_FILE_NAME ))
	.pipe(gutil.env.comments === 'disabled' ? gutil.noop() : strip({'safe':true,'trim':true}))
	.pipe(header(headerComment))
	.pipe(sourcemaps.write({addComment: false}))
	.pipe(gulp.dest(SOURCE_DIR))
	.pipe(reload({stream: true}));

});

/*!
 *	Build JS for Production
 */
gulp.task('build-js:min', function()
{
	gulp.run(['lint'], function(error)
	{
		if (error)
		{
			console.log(error);
		}
		else
		{
			gulp.run('build-js', function (e)
			{
				gutil.log('Minimizing scripts..');
				return gulp.src( SCRIPT_FILE )
				.pipe(sourcemaps.init())
				.pipe(rename({prefix:'min-'}))
				.pipe( uglify() )
				.pipe(sourcemaps.write())
				.pipe(gulp.dest(DIST_DIR));
			});
		}
	});
});

/*!
 *  SASS TASK RUNNERS
 */
gulp.task('build-css', ['clean-source:css','gitInfo'] ,function() {
	d = new Date(),
	headerComment = '/*!\n * Branch: ' + gitBranch + '\n * Commit: #' + gitHash + '\n * Date: ' + d +'\n */\n';
	return gulp.src(STYLES_DIR+'/styles.scss')
	.pipe(sass())
	.pipe(header(headerComment))
	.pipe(gulp.dest(SOURCE_DIR))
	.pipe(reload({stream: true}));
 });

/*!
 * Dev Mode
 */
gulp.task('develop-mode', ['build-js','build-css'] , function() {
	browserSync.init("./", {
		open: false,
		server : {
			'baseDir': './',
			'https': true,
			'routes': {
				'/sources' : 'sources'
			}
		},
	});

	gulp.watch( TESTS_DIR+'/**/*.html', ['test-files-reload']);

	gulp.watch( STYLES_DIR+'/**/*.scss' , ['build-css']);
	// Builds JS
	gulp.watch( SCRIPTS_DIR+'/**/*.js', ['build-js']);
});



