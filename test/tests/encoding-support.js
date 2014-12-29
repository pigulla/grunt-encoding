var fs = require('fs'),
    path = require('path'),
    util = require('util');

var assert = require('assert'),
    rewire = require('rewire');

var iconvWrapper = rewire('../../tasks/iconv-wrapper');

describe('encoding support', function () {
    describe('on ubuntu', function () {
        var revert;

        beforeEach(function () {
            var fixture = path.join(__dirname, '..', 'fixtures', 'iconv-list.ubuntu'),
                output = fs.readFileSync(fixture).toString();

            revert = iconvWrapper.__set__('exec', function (executable, args, callback) {
                callback(null, 0, output, '');
            });
        });

        afterEach(function () {
            revert();
        });

        it('supports UTF-8 encoding', function (done) {
            iconvWrapper.assertEncodingSupport('iconv', 'UTF-8', '\n', function (error) {
                assert.equal(error, null);
                done();
            });
        });

        it('does not support FOO32 encoding', function (done) {
            iconvWrapper.assertEncodingSupport('iconv', 'FOO32', '\n', function (error) {
                assert(util.isError(error));
                assert.equal(error.toString(), 'Error: iconv does not support encoding "FOO32"');
                done();
            });
        });
    });
});
