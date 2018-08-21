// gulp
var gulp = require('gulp');
var debug = require('gulp-debug');
var config = require('./gulp.config.json');

// build
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate')
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var flatten = require('gulp-flatten');
var CacheBuster = require('gulp-cachebust');
// var imagemin = require('gulp-imagemin');
// var pngquant = require('imagemin-pngquant');
var plumber = require('gulp-plumber');
var preprocess = require('gulp-preprocess');


//workflow
var server = require('gulp-express');
var connect = require('gulp-connect');
var notify = require('gulp-notify');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');

var cachebust = new CacheBuster();


// tasks
gulp.task('lint', function() {
    gulp.src([config.src.js + '/**/*.js'])
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});
gulp.task('clean', function() {
    return gulp.src(config.dist.root + '/**/*', {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});
gulp.task('sass', function(callback) {
    return gulp.src([config.src.sass + '/app.scss'])
        // .pipe(debug())
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        // .pipe(cachebust.resources())
        .pipe(gulp.dest(config.dist.css));
});

gulp.task('app-css', ['sass'], function() {
    var opts = {
        comments: true,
        spare: true
    };
    gulp.src([config.dist.css + '/*'])
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(minifyCSS(opts))
        .pipe(rename('app.min.css'))
        // .pipe(cachebust.resources())
        .pipe(gulp.dest(config.dist.css))
});

gulp.task('lib-css', ['sass'], function() {
    var opts = {
        comments: true,
        spare: true
    };
    gulp.src([
            config.src.lib + '/bootstrap/dist/css/bootstrap.css'
        ])
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(minifyCSS(opts))
        .pipe(rename('lib.min.css'))
        // .pipe(cachebust.resources())
        .pipe(gulp.dest(config.dist.css))
});

gulp.task('build-js', function() {
    return gulp.src(config.src.js + '/**/*.js')
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(ngAnnotate())
        .pipe(sourcemaps.write('.'))
        // .pipe(cachebust.resources())
        .pipe(gulp.dest(config.dist.js))
});
gulp.task('build-js-libs', function() {
    return gulp.src([
            config.src.lib + '/jquery/dist/jquery.min.js',
            config.src.lib + '/jquery.flowtype.js',
            config.src.lib + '/html2canvas.js',
            config.src.lib + '/es6-promise/promise.min.js',
            config.src.lib + '/angular/angular.min.js',
            config.src.lib + '/bootstrap/js/dropdown.js',
            config.src.lib + '/angular-ui-router/release/angular-ui-router.min.js',
            config.src.lib + '/angular-route/angular-route.min.js',
            config.src.lib + '/angular-flowtype/angular-flowtype.js',
            config.src.lib + '/elasticsearch/elasticsearch.angular.min.js',
            config.src.lib + '/ngstorage/ngStorage.min.js',
            config.src.lib + '/angular-resource/angular-resource.min.js',
            config.src.lib + '/angular-google-analytics/angular.ga.js',
            config.src.lib + '/angularjs-geolocation/dist/angularjs-geolocation.min.js',
            config.src.lib + '/underscore/underscore-min.js',
            config.src.lib + '/moment/min/moment.min.js',
            config.src.lib + '/moment-timezone/builds/moment-timezone-with-data.min.js',
            config.src.lib + '/angular-animate/angular-animate.min.js',
            config.src.lib + '/angular-google-maps/dist/angular-google-maps.min.js',
            config.src.lib + '/angular-ui-bootstrap/ui-bootstrap.0.12.0.js',
            config.src.lib + '/angular-sanitize/angular-sanitize.min.js',
            config.src.lib + '/angular-timeline/angular-timeline.js',
            config.src.lib + '/angular-ui-select/dist/select_0.19.7.min.js',
            config.src.lib + '/bootstrap/js/tab.js',
            config.src.lib + '/angularjs-datepicker/dist/angular-datepicker.js',
            config.src.lib + '/angular-text-mask/angular1TextMask.js',
            config.src.lib + '/sifter/sifter.js',
            config.src.lib + '/caag-infinite-scroll/caag-infinite-scroll.js'
        ])
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('libs.js'))
        .pipe(ngAnnotate())
        .pipe(sourcemaps.write('.'))
        // .pipe(cachebust.resources())
        .pipe(gulp.dest(config.dist.js))
});

gulp.task('build-4-prod', ['build'], function() {
    return gulp.src(config.dist.js + '/app.js')
        .pipe(preprocess({
            context: {
                GULP_ENV: 'prod',
                DEBUG: false
            }
        })) //To set environment variables in-line
        .pipe(gulp.dest(config.dist.js))

});
gulp.task('build-4-qat', ['build'], function() {
    return gulp.src(config.dist.js + '/app.js')
        .pipe(preprocess({
            context: {
                GULP_ENV: 'qat',
                DEBUG: true
            }
        })) //To set environment variables in-line
        .pipe(gulp.dest(config.dist.js))

});
gulp.task('build-4-stage', ['build'], function() {
    return gulp.src(config.dist.js + '/app.js')
        .pipe(preprocess({
            context: {
                GULP_ENV: 'stage',
                DEBUG: true
            }
        })) //To set environment variables in-line
        .pipe(gulp.dest(config.dist.js))

});
gulp.task('build-4-dev', ['build'], function() {
    return gulp.src(config.dist.js + '/app.js')
        .pipe(preprocess({
            context: {
                GULP_ENV: 'dev',
                DEBUG: true
            }
        })) //To set environment variables in-line
        .pipe(gulp.dest(config.dist.js))

});
// gulp.task('imagemin', function() {
//     return gulp.src(config.src.img + '/**/*')
//         .pipe(plumber({
//             errorHandler: notify.onError("Error: <%= error.message %>"),
//             handleError: function(err) {
//                 console.log(err);
//                 this.emit("error");
//             }
//         }))
//         .pipe(imagemin({
//             progressive: true,
//             svgoPlugins: [{
//                 removeViewBox: false
//             }],
//             use: [pngquant()]
//         }))
//         .pipe(gulp.dest(config.dist.img + '/'));
// });

// gulp.task('build-js', function() {
//   gulp.src([config.src.js + '/**/*.js'])
//     .pipe(concat)
//     .pipe(uglify({
//       mangle: false,
//       compress: false,
//       output: {
//         beautify: true
//       }
//       // inSourceMap:
//       // outSourceMap: "app.js.map"
//     }))
//     .pipe(gulp.dest('./dist/js'))
// });

gulp.task('copy-html-partials', function() {
    gulp.src(config.src.root + '/app/**/*.html')
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(flatten())
        .pipe(gulp.dest(config.dist.partial + '/'))
        .pipe(livereload());
});
gulp.task('copy-index', function() {
    gulp.src([config.src.root + '/index.html', config.src.root + '/favicon.ico'])
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        // .pipe(cachebust.references())
        .pipe(gulp.dest(config.dist.root))
        .pipe(livereload());
});
gulp.task('copy-libs', function() {
    gulp.src(config.src.lib + '/**/*')
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(gulp.dest(config.dist.lib + '/'));
});
gulp.task('copy-fonts', function() {
    gulp.src(config.src.font + '/**/*')
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(gulp.dest(config.dist.font + '/'));
});

//use imagemin instead of copy-img
gulp.task('copy-img', function() {
    gulp.src(config.src.img + '/**/*')
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(gulp.dest(config.dist.img + '/'));
});
gulp.task('copy-data', function() {
    gulp.src(config.src.data + '/**/*')
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>"),
            handleError: function(err) {
                console.log(err);
                this.emit("error");
            }
        }))
        .pipe(gulp.dest(config.dist.data + '/'));
});
gulp.task('connect', function() {
    connect.server({
        root: 'app/',
        port: 8888
    });
});
gulp.task('connectDist', function() {
    connect.server({
        root: 'dist/',
        port: 5000
    });
});

gulp.task('server', function() {
    // Start the server at the beginning of the task
    server.run(['web.js'], { // options for child_process.options
        "PORT": 5000
    }, false);

});

gulp.task('debug', function() {
    return gulp.src('./app/sass/_payload.scss')
        .pipe(debug({
            title: 'unicorn:'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['build', 'server'], function() {
    livereload.listen({
        basePath: 'dist'
    });
    gulp.watch([
        config.src.js + '/**/*.*',
        config.src.sass + '/**/*.*',
        config.src.root + '/_assets/img/**/*.*',
        config.src.root + '/_assets/data/**/*.*',
        config.src.root + '/**/*.html'
    ], function() {
        gulp.start('watch-build');
        // server.notify
        // .pipe('livereload');
    });
});
gulp.task('watch-p', ['build-4-prod', 'server'], function() {
    livereload.listen({
        basePath: 'dist'
    });
    gulp.watch([
        config.src.js + '/**/*.*',
        config.src.sass + '/**/*.*',
        config.src.root + '/_assets/img/**/*.*',
        config.src.root + '/_assets/data/**/*.*',
        config.src.root + '/**/*.html'
    ], function() {
        gulp.start('watch-build');
        // server.notify
        // .pipe('livereload');
    });
});
gulp.task('watch-q', ['build-4-qat', 'server'], function() {
    livereload.listen({
        basePath: 'dist'
    });
    gulp.watch([
        config.src.js + '/**/*.*',
        config.src.sass + '/**/*.*',
        config.src.root + '/_assets/img/**/*.*',
        config.src.root + '/_assets/data/**/*.*',
        config.src.root + '/**/*.html'
    ], function() {
        gulp.start('build-4-qat');
        // server.notify
        // .pipe('livereload');
    });
});
gulp.task('watch-s', ['build-4-stage', 'server'], function() {
    livereload.listen({
        basePath: 'dist'
    });
    gulp.watch([
        config.src.js + '/**/*.*',
        config.src.sass + '/**/*.*',
        config.src.root + '/_assets/img/**/*.*',
        config.src.root + '/_assets/data/**/*.*',
        config.src.root + '/**/*.html'
    ], function() {
        gulp.start('build-4-stage');
        // server.notify
        // .pipe('livereload');
    });
});
gulp.task('watch-d', ['build-4-dev', 'server'], function() {
    livereload.listen({
        basePath: 'dist'
    });
    gulp.watch([
        config.src.js + '/**/*.*',
        config.src.sass + '/**/*.*',
        config.src.root + '/_assets/img/**/*.*',
        config.src.root + '/_assets/data/**/*.*',
        config.src.root + '/**/*.html'
    ], function() {
        gulp.start('build-4-dev');
        // server.notify
        // .pipe('livereload');
    });
});

gulp.task('livereload', function() {
    livereload();
});

// default task
gulp.task('default', ['build']);

// gulp.task('dev', ['run', 'livereload', 'watch']);

// //run the app
// gulp.task('run', ['connectDist']);

// subtask for copying files
gulp.task('copy', ['copy-html-partials', 'copy-index', 'copy-data', 'copy-img', 'copy-fonts']);

// build task
gulp.task('build', ['lint', 'app-css', 'lib-css', 'build-js', 'build-js-libs', 'copy', 'livereload'], function() {
    // return gulp.src('dist/index.html')
    // .pipe(cachebust.references())
    // .pipe(gulp.dest('dist/'));
});
gulp.task('watch-build', ['lint', 'app-css', 'lib-css', 'build-js', 'copy-html-partials', 'copy-index', 'copy-data', 'livereload']);

gulp.task('prod', ['build-4-prod']);

gulp.task('qat', ['build-4-qat']);

gulp.task('stage', ['build-4-stage']);

gulp.task('dev', ['build-4-dev']);