'use strict';

module.exports = plugin;

var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');

function plugin(options) {
  var renames = {};
  var cache = [];

  options = options || {};

  if (!options.canonicalUris) {
    options.canonicalUris = true;
  }

  options.replaceInExtensions = options.replaceInExtensions || ['.js', '.css', '.html', '.hbs'];

  return through.obj(function collectRevs(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-rev-replace', 'Streaming not supported'));
      return cb();
    }

    // Collect renames from reved files.
    if (file.revOrigPath) {
      renames[fmtPath(file.revOrigBase, file.revOrigPath)] = fmtPath(file.base, file.path);
    }

    if (options.replaceInExtensions.indexOf(path.extname(file.path)) > -1) {
      // file should be searched for replaces
      cache.push(file);
    } else {
      // nothing to do with this file
      this.push(file);
    }

    cb();
  }, function replaceInFiles(cb) {
    var stream = this;

    // Once we have a full list of renames, search/replace in the cached
    // files and push them through.
    cache.forEach(function replaceInFile(file) {
      var contents = file.contents.toString();

      for (var rename in renames) {
        if (renames.hasOwnProperty(rename)) {
          contents = contents.split(rename).join(renames[rename]);
        }
      }

      file.contents = new Buffer(contents);
      stream.push(file);
    });

    cb();
  });

  function fmtPath(base, filePath) {
    var newPath = path.relative(base, filePath);

    if (path.sep !== '/' && options.canonicalUris) {
      newPath = newPath.split(path.sep).join('/');
    }

    return newPath;
  }
}
