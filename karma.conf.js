// Karma configuration
// Generated on Tue Jul 07 2015 21:42:04 GMT-0500 (CDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        "dist/lib/es6-promise/promise.min.js",
        "dist/lib/angular/angular.js",
        "dist/lib/angular-route/angular-route.js",
        "dist/lib/angular-mocks/angular-mocks.js",
        "dist/lib/ngstorage/ngStorage.min.js",
        "dist/lib/angular-google-analytics/angular.ga.js",
        "dist/lib/angularjs-geolocation/dist/angularjs-geolocation.min.js",
        "dist/lib/angular-ui-bootstrap/ui-bootstrap.0.12.0",
        "dist/lib/underscore/underscore-min.js",
        "dist/lib/jquery/dist/jquery.min.js",
        "dist/lib/moment/min/moment.min.js",
        "dist/lib/jquery.flowtype.js",
        'dist/js/app.js',
        'src/tests/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],//['Chrome', 'PhantomJS', 'IE', 'Safari', 'Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
}
