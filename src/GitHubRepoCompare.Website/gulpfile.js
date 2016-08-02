/// <binding AfterBuild='build' Clean='clean' ProjectOpened='watch' />
"use strict";

var gulp = require('gulp');
var assign = Object.assign || require('object.assign');
var browserSync = require('browser-sync');
var bundler = require('aurelia-bundler');
var changed = require('gulp-changed');
var del = require('del');
var exec = require('child_process').exec;
var htmlmin = require('gulp-htmlmin');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-typescript');
var vinylPaths = require('vinyl-paths');

var paths = require('./build/paths');
var bundles = require('./build/bundles.js');

var bundleConfig = {
    force: true,
    baseURL: './wwwroot',
    configPath: './wwwroot/config.js',
    bundles: bundles.bundles
};

var typescriptCompiler = typescriptCompiler || null;

gulp.task('build', function(callback) {
    return runSequence(
        'clean',
        ['build-system', 'build-html', 'build-css'],
        callback
    );
});

gulp.task('build-css', function() {
    return gulp.src(paths.css)
        .pipe(changed(paths.output, { extension: '.css' }))
        .pipe(gulp.dest(paths.output));
});

gulp.task('build-html', function() {
    return gulp.src(paths.html)
        .pipe(changed(paths.output, { extension: '.html' }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(paths.output));
});

gulp.task('build-system', function() {
    if (!typescriptCompiler) {
        typescriptCompiler = typescript.createProject('tsconfig.json', {
            "typescript": require('typescript')
        });
    }

    return gulp.src(paths.dtsSrc.concat(paths.source))
        .pipe(plumber())
        .pipe(changed(paths.output, { extension: '.ts' }))
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(typescript(typescriptCompiler))
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '/src' }))
        .pipe(gulp.dest(paths.output));
});

gulp.task('bundle', ['build'], function() {
    return bundler.bundle(bundleConfig);
});

gulp.task('clean', ['unbundle'], function() {
    return gulp.src([paths.output])
        .pipe(vinylPaths(del));
});

gulp.task('unbundle', function() {
    return bundler.unbundle(bundleConfig);
});

gulp.task('watch',
    function() {
        gulp.watch(paths.source, ['build-system', browserSync.reload]).on('change', reportChange);
        gulp.watch(paths.html, ['build-html', browserSync.reload]).on('change', reportChange);
        gulp.watch(paths.css, ['build-css']).on('change', reportChange);
        gulp.watch(paths.style, function() {
            return gulp.src(paths.style)
                .pipe(browserSync.stream());
        }).on('change', reportChange);
    });

function reportChange(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}