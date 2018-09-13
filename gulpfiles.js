const gulp = require('gulp');
const sass = require('gulp-sass'); //sass编译
const cssmin = require('gulp-clean-css'); //css压缩
const jsmin = require('gulp-uglify'); //js压缩
const concat = require('gulp-concat'); //合并文件
const rename = require("gulp-rename"); //文件重命名
const gulputil = require("gulp-util"); //gulp-util
const babel = require("gulp-babel"); //gulp-babel

/**
 * css和js文件目录配置源文件目录、编译目录、输出目录
 * @type {{src: {sass_dir: string, js_dir: string}, compile: {css_dir: string, js_dir: string}, dest: {css_dir: string, js_dir: string}}}
 */
const cfg = {
    // 源文件目录
    src: {
        app_dir: '_src/app',
        sass_dir: "_src/static/sass",
        js_dir: "_src/static/js",
        crcc_dir: 'web/static/crcc_src',
    },
    // 输出目录
    dist: {
        app_dir: '_dist/app',
        css_dir: "_dist/static/css",
        js_dir: "_dist/static/js",
        crcc_dir: 'web/static/crcc',
    },
}

/**
 * Sass编译任务 src->compile
 */
gulp.task('Sass', function () {
    gulp.src(`${cfg.src.sass_dir}/*.s[a|c]ss`)
        .pipe(sass())//css 编译
        .pipe(cssmin())// 压缩
        .pipe(rename({suffix: '.min'}))// 重命名
        .pipe(gulp.dest(`${cfg.dist.css_dir}`));// 输出目录
});

/**
 * 监听sass，文件发生变动，调用sass任务
 */
gulp.task('WatchSass', function () {
    gulp.watch(`${cfg.src.sass_dir}/*.s[a|c]ss`, ['Sass']);
});


/**
 * 合并js文件任务 src->compile
 */
gulp.task('MinJs', function () {
    gulp.src(`${cfg.src.js_dir}/*.js`)
        .pipe(concat('index.js')) // 合并
        .pipe(jsmin())// 压缩
        .pipe(rename({suffix: '.min'}))// 重命名为xx.min.js
        .pipe(gulp.dest(`${cfg.dist.js_dir}`));// 输出
});


/* 监听js文件，当js下所有的js文件发生改变时，调用minJs任务 */
gulp.task('WatchJs', function () {
    gulp.watch(`${cfg.src.js_dir}/*.js`, ['MinJs']);
});

/**
 * 复制src的app目录到dist
 */
gulp.task('Copy', function () {
    gulp.src(`${cfg.src.app_dir}/**/*`)
        .pipe(gulp.dest(`${cfg.dist.app_dir}`));
});

gulp.task('WatchCopy', function () {
    gulp.watch(`${cfg.src.app_dir}/**/*`, ['Copy']);
})

/**
 * crcc静态资源文件压缩
 */
gulp.task("WatchCrcc", function () {
    gulp.watch(`${cfg.src.crcc_dir}/**/*`, ['MinCrcc']);
});

gulp.task("MinCrcc", function () {
    gulp.src(`${cfg.src.crcc_dir}/plugin_test.js`)
        .pipe(babel({
            presets: ['es2015'] // es5检查机制
        }))
        .pipe(concat('crcc.js')) // 合并
        .pipe(jsmin())// 压缩
        .on('error', function (err) {
            gulputil.log(gulputil.colors.red('[Error]'), err.toString());
        })
        .pipe(rename({suffix: '.min'}))// 重命名为xx.min.js
        .pipe(gulp.dest(`${cfg.dist.crcc_dir}`))// 输出
});


// 添加任务
let taskArr = [];
// taskArr.push('WatchSass');
// taskArr.push('Sass');
// taskArr.push('WatchJs');
// taskArr.push('MinJs');
// taskArr.push('WatchCopy');
// taskArr.push('Copy');
taskArr.push('WatchCrcc');
taskArr.push('MinCrcc');

gulp.task('default', taskArr); //定义默认任务，只需要开启默认任务就可以
