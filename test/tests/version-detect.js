var fs = require('fs'),
    path = require('path');

var assert = require('assert'),
    rewire = require('rewire');

var iconvWrapper = rewire('../../tasks/iconv-wrapper');

describe('version detection', function () {
    it('on Ubuntu', function (done) {
        var fixture = path.join(__dirname, '..', 'fixtures', 'iconv-version.ubuntu'),
            output = fs.readFileSync(fixture).toString(),
            revert;

        revert = iconvWrapper.__set__('exec', function (executable, args, callback) {
            callback(null, 0, output, '');
        });

        iconvWrapper.getVersion('iconv', function (error, version) {
            assert.equal(error, null);
            assert.equal(version, '2.19');

            revert();
            done();
        });
    });

    it('on Windows', function (done) {
        var fixture = path.join(__dirname, '..', 'fixtures', 'iconv-version.windows'),
            output = fs.readFileSync(fixture).toString(),
            revert;

        revert = iconvWrapper.__set__('exec', function (executable, args, callback) {
            callback(null, 0, output, '');
        });

        iconvWrapper.getVersion('iconv', function (error, version) {
            assert.equal(error, null);
            assert.equal(version, '1.14');

            revert();
            done();
        });
    });
});
