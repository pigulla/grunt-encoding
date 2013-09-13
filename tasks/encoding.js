/*
 * grunt-encoding
 * https://github.com/pigulla/grunt-encoding
 *
 * Copyright (c) 2013 Raphael Pigulla
 * Licensed under the MIT license.
 */
'use strict';

var spawn = require('child_process').spawn,
    async = require('async'),
    fkt = require('fkt'),
    util = require('util'),
    path = require('path');

function getIconvVersion(callback) {
    var iconv = spawn('iconv', ['--version']),
        error,
        stderr = '',
        stdout = '';

    iconv.stdout.on('data', function (data) {
        stdout += data.toString();
    });
    iconv.stderr.on('data', function (data) {
        stderr += data.toString();
    });
    iconv.on('error', function (err) {
        error = err;
    });
    iconv.on('close', function (code) {
        if (code === 0) {
            var matches = stdout.match(/^iconv (?:.+?) (\d+\.\d+(?:\.\d+)?)$/m);
            if (matches) {
                callback(null, matches[1]);
            } else {
                callback(null, '<unknown>');
            }
        } else if (error) {
            callback(new Error('could not spawn iconv (' + error.message + ')'));
        } else {
            callback(new Error('iconv failed with exit code ' + code));
        }
    });}

function getSupportedEncodings(callback) {
    var iconv = spawn('iconv', ['--list']),
        error,
        stderr = '',
        stdout = '';

    iconv.stdout.on('data', function (data) {
        stdout += data.toString();
    });
    iconv.stderr.on('data', function (data) {
        stderr += data.toString();
    });
    iconv.on('error', function (err) {
        error = err;
    });
    iconv.on('close', function (code) {
        if (code === 0) {
            callback(null, stdout.trim().split("\n"));
        } else if (error) {
            callback(new Error('could not spawn iconv (' + error.message + ')'));
        } else {
            callback(new Error('iconv failed with exit code ' + code));
        }
    });
}

function assertEncodingSupported(encoding, callback) {
    getSupportedEncodings(function (err, encodings) {
        if (err) {
            callback(err);
            return;
        }

        if (encodings.indexOf(encoding) < 0 && encodings.indexOf(encoding + '//') < 0) {
            callback(new Error(util.format(
                'iconv does not support encoding "%s"',
                encoding)
            ));
        } else {
            callback();
        }
    });
}

function runIconv(file, encoding, callback) {
    var iconv = spawn('iconv', ['--from-code', encoding, file]),
        error,
        stderr = '';

    iconv.stdout.on('data', fkt.noop);
    iconv.stderr.on('data', function (data) {
        stderr += data.toString();
    });
    iconv.on('error', function (err) {
        error = err;
    });
    iconv.on('close', function (code) {
        if (code === 0) {
            callback(null, true);
        } else if (error) {
            callback(new Error('could not check encoding with iconv (' + error.message + ')'));
        } else {
            var messages = stderr.trim().split('\n').map(function (message) {
                var msg = message.match(/^iconv: (.*)/);
                return msg ? msg[1] : message;
            });
            callback(null, false, messages);
        }
    });
}

module.exports = function (grunt) {
    grunt.registerMultiTask('encoding', 'Check character encoding of files.', function () {
        var done = this.async(),
            self = this;

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
                encoding: 'UTF8'
            });

        async.waterfall([
            function (cb) {
                getIconvVersion(cb);
            },
            function (version, cb) {
                grunt.verbose.ok('iconv found (version ' + version + ')');
                assertEncodingSupported(options.encoding, cb);
            },
            function (cb) {
                var errors = 0,
                    files = self.filesSrc.filter(function (file) {
                        return grunt.file.isFile(file);
                    });

                async.eachLimit(files, 5, function (file, cb) {
                    runIconv(file, options.encoding, function (err, ok, messages) {
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
        ], function (err, errors) {
            if (err) {
                grunt.fail.warn(err.message);
            } else if (errors) {
                grunt.fail.warn(errors + ' files are not encoded correctly')
            } else {
                grunt.log.ok('All files are encoded correctly');
            }
            done();
        });

    });
};
