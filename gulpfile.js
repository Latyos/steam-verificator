"use strict";

const path = require('path');
const gulp = require('gulp');
const nsp = require('gulp-nsp');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const del = require('del');
const tsc = require("gulp-typescript");

gulp.task('nsp', function (cb) {
nsp({package: path.resolve('package.json')}, cb);
});

gulp.task('watch', function () {
gulp.watch(['lib/**/*.js', 'test/**'], ['test']);
});

gulp.task('clean', function () {
return del('dist');
});

gulp.task("typescript", ["clean"], function(){
	return gulp.src("./lib/**/*.ts")
		.pipe(plumber())
		.pipe(tsc())
		.pipe(gulp.dest("./dist"));
});

gulp.task('prepublish', ['nsp', 'typescript']);
gulp.task('default', ["prepublish"]);
