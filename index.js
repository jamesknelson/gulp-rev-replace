'use strict';
var crypto = require('crypto');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');

function relPath(base, filePath) {
  var newPath = filePath.replace(base, '');
  if (filePath !== newPath && newPath[0] === path.sep) {
    return newPath.substr(1);
  } else {
    return newPath;
  }
}

var plugin = function () {
  var renames = {};
  var cache = [];

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-rev-replace', 'Streaming not supported'));
      return cb();
    }

    if (file.revOrigPath) {
      renames[relPath(file.revOrigBase, file.revOrigPath)] = relPath(file.base, file.path);

      // Assume renamed files don't need any replacing and pass them through
      // (we don't want to cache anything huge)
      this.push(file);
      cb();
    } else {
      cache.push(file);
      cb();
    }
  }, function(cb) {
    // Once we have a full list of renames, search/replace in the non-renamed
    // files and push them through.
    var file;
    for (var i=0, ii=cache.length; i!=ii; i++) {
      file = cache[i];
      for (path in renames) {
        if (renames.hasOwnProperty(path)) {
          file.contents = new Buffer(file.contents.toString().replace(path, renames[path]));
        }
      }
      this.push(file);
    }

    cb();
  });
};

module.exports = plugin;