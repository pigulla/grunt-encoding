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

module.exports = function (grunt) {
    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('encoding', 'Check character encoding of files.', function () {
        var done = this.async();

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            charset: 'UTF8'
        });

        async.eachLimit(this.filesSrc, 5, function (file, callback) {
            if (!grunt.file.isFile(file)) {
                callback();
                return;
            }

            var f = path.join(process.cwd(), file),
                iconv = spawn('iconv', ['--from-code', options.charset, f]),
                stderr = '';

            iconv.stdout.on('data', fkt.noop);
            iconv.stderr.on('data', function (data) {
                stderr += data.toString();
            });

            iconv.on('close', function (code) {
                if (code === 0) {
                    grunt.verbose.ok(file);
                } else {
                    stderr.trim().split('\n').forEach(function (message) {
                        var msg = message.match(/^iconv: (.*)/);
                        grunt.fail.warn(util.format(
                            'Encoding error in file "%s" (%s)',
                            file, msg ? msg[1] : message
                        ));
                    });
                }
                callback();
            });
        }, function (err, results) {
            done();
        });
    });
};
