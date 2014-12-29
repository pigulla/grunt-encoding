/*
 * grunt-encoding
 * https://github.com/pigulla/grunt-encoding
 *
 * Copyright (c) 2013-2014 Raphael Pigulla <pigulla@four66.com>
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/**/*.js',
                'test/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/tests/**/*.js']
            }
        },

        // Example configuration
        encoding: {
            'invalid_executable': {
                options: {
                    iconv: 'foo'
                },
                files: {
                    src: [
                        'test/fixtures/text/ansi.txt',
                        'test/fixtures/text/simple.txt',
                        'test/fixtures/text/utf8.txt',
                        'test/fixtures/text/ucs2-be.txt'
                    ]
                }
            },
            'will_fail': {
                options: {
                    encoding: 'UTF8'
                },
                files: {
                    src: [
                        'test/fixtures/text/ansi.txt',
                        'test/fixtures/text/simple.txt',
                        'test/fixtures/text/utf8.txt',
                        'test/fixtures/text/ucs2-be.txt'
                    ]
                }
            },
            'will_pass': {
                options: {
                    charset: 'utf8'
                },
                files: {
                    src: [
                        'test/fixtures/text/simple.txt',
                        'test/fixtures/text/utf8.txt'
                    ]
                }
            }
        }
    });

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-test');
};
