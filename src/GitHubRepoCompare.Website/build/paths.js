var appRoot = 'src/';
var outputRoot = 'wwwroot/dist/';
var exportSourceRoot = 'wwwroot/';

module.exports = {
    root: appRoot,
    source: appRoot + '**/*.ts',
    html: appRoot + '**/*.html',
    css: appRoot + '**/*.css',
    style: 'styles/**/*.css',
    output: outputRoot,
    exportSourceRoot: exportSourceRoot,
    dtsSrc: [
        'typings/**/*.d.ts',
        'custom_typings/**/*.d.ts'
    ]
}