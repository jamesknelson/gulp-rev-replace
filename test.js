'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var filter = require('gulp-filter');
var rev = require('gulp-rev');
var revReplace = require('./index');
var path = require('path');

it('should replace filenames of only reved files', function (cb) {
  var cssFilter = filter("**/*.css");

  var stream = cssFilter
    .pipe(rev())
    .pipe(cssFilter.restore())
    .pipe(revReplace());

  var fileCount = 0;
  var unreplacedPattern = /style\.css/;
  stream.on('data', function(file) {
    var contents = file.contents.toString();

    if (file.path.substr(-4) == 'html') {
      assert(
        !unreplacedPattern.test(contents),
        "The renamed file's name should be replaced"
      );
    } else if (file.path.substr(-3) == 'css') {
      assert(
        unreplacedPattern.test(contents),
        "The renamed file should not be modified"
      );
    }

    fileCount++;
  });
  stream.on('end', function() {
    assert.equal(fileCount, 2, "Only two files should pass through the stream");
    cb();
  });

  cssFilter.write(new gutil.File({
    path: 'css/style.css',
    contents: new Buffer('/* filename: /css/style.css */ body { color: red; } ')
  }));
  cssFilter.write(new gutil.File({
    path: 'index.html',
    contents: new Buffer('<html><head><link rel="stylesheet" href="/css/style.css" /></head><body></body></html>')
  }));
  cssFilter.end();
});
