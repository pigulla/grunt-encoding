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
                grunt.verbose.ok('Using' +
                ' executable "' + executable + '"');
                iconvWrapper.getVersion(executable, cb);
            },
            function (version, cb) {
                grunt.verbose.ok('iconv found (version ' + version + ')');
                iconvWrapper.assertEncodingSupport(executable, options.encoding, grunt.util.linefeed, cb);
            },
            function (cb) {
                var errors = 0,
                    files = self.filesSrc.filter(function (file) {
                        return grunt.file.isFile(file);
                    });

                async.eachLimit(files, 5, function (file, cb) {
                    iconvWrapper.run(executable, file, options.encoding, function (err, ok, messages) {
                        if (err) {
                            cb(err);
                        } else if (ok) {
                            grunt.verbose.ok(util.format('File ok: %s', file));
                            cb();
                        } else {
                            errors++;
                            messages.forEach(function (message) {
                                grunt.verbose.warn(util.format(
                                    'Problem with file %s: %s',
                                    file, message
                                ));
                            });
                            cb();
                        }
                    });
                }, function (err) {
                    cb(err, errors);
                });
            }
        ], function (err , errors) {
            if (err) {
                grunt.fail.warn(err.message);
            } else if (errors) {
                grunt.fail.warn(errors + ' files are not encoded correctly');
            } else {
                grunt.log.ok('All files are encoded correctly');
            }
            done();
        });
    });
};
