'use strict';

function byLongestUnreved(a, b) {
  return b.unreved.length - a.unreved.length;
}

function getPathSeparator(filePath) {
	if ((filePath.match(/\\/g) || []).length > (filePath.match(/\//g) || []).length) {
		return '\\';
	}

	return '/';
}

module.exports = {
  byLongestUnreved: byLongestUnreved,
  getPathSeparator: getPathSeparator
};
