/// <binding Clean='clean' />
"use strict";

var gulp = require('gulp');
var paths = require('../paths');
var bundler = require('aurelia-bundler');

var bundles = {

};

var config = {
    force: true,
    baseURL: './wwwroot',
    configPath: './wwwroot/config.js',
    bundles: bundles
};

gulp.task('build', function (callback) {
    return runSequence(
      'clean',
      ['build-system', 'build-html', 'build-css'],
      callback
    );
});

gulp.task('bundle', ['build'], function () {
    return bundler.bundle(config);
});

gulp.task('unbundle', function () {
    return bundler.unbundle(config);
});


gulp.task('watch', function() {
    gulp.watch(paths.source, ['build-system', browserSync.reload]).on('change', reportChange);
    gulp.watch(paths.html, ['build-html', browserSync.reload]).on('change', reportChange);
    gulp.watch(paths.css, ['build-css']).on('change', reportChange);
});

function reportChange(event) {
    console.log(`event.typ: '${event.path}'`);
}