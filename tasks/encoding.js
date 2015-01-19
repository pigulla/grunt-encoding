/*
 * grunt-encoding
 * https://github.com/pigulla/grunt-encoding
 *
 * Copyright (c) 2013-2015 Raphael Pigulla <pigulla@four66.com>
 * Licensed under the MIT license.
 */
'use strict';

var util = require('util');

var async = require('async'),
    which = require('which');

var iconvWrapper = require('./iconv-wrapper');

module.exports = function (grunt) {
    grunt.registerMultiTask('encoding', 'Check character encoding of files.', function () {
        var done = this.async(),
            self = this;

        // Merge task-specific and/or target-specific options with these defaults.
        var executable,
            options = this.options({
                encoding: 'UTF8',
                iconv: null
            });

        async.waterfall([
            function (cb) {
                if (options.iconv === null) {
                    which('iconv', cb);
                } else {
                    if (grunt.file.exists(options.iconv) &&
                        (grunt.file.isFile(options.iconv) || grunt.file.isLink(options.iconv))
                    ) {
                        cb(null, options.iconv);
                    } else {
                        cb(new Error('iconv executable "' + options.iconv + '" not found'));
                    }
                }
            },
            function (file, cb) {
                executable = file;
                grunt.verbose.ok('Using' + ' executable "' + executable + '"');
                iconvWrapper.getVersion(executable, cb);
            },
            function (version, cb) {
                grunt.verbose.ok('iconv version ' + version + ' detected');
                iconvWrapper.assertEncodingSupport(executable, options.encoding, cb);
            },
            function (cb) {
                var filesWithErrors = [],
                    files = self.filesSrc.filter(function (file) {
                        return grunt.file.isFile(file);
                    });

                async.eachLimit(files, 5, function (file, cb) {
                    iconvWrapper.check(executable, file, options.encoding, function (err, ok, problems) {
                        if (err) {
                            cb(err);
                        } else if (ok) {
                            grunt.verbose.ok(util.format('File OK: %s', file));
                            cb();
                        } else {
                            filesWithErrors.push(file);
                            grunt.fail.warn(util.format(
                                'File %s is not encoded correctly as %s', file, options.encoding));
                            problems.forEach(function (message) {
                                grunt.verbose.warn(message);
                            });
                            cb();
                        }
                    });
                }, function (err) {
                    cb(err, filesWithErrors);
                });
            }
        ], function (err, filesWithErrors) {
            if (err) {
                grunt.fail.fatal(err.message);
            } else if (filesWithErrors.length === 0) {
                grunt.log.ok('All files are encoded correctly');
            }
            done();
        });
    });
};
