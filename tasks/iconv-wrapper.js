'use strict';

var path = require('path'),
    spawn = require('child_process').spawn;

function exec(executable, args, callback) {
    var iconv = spawn(executable, args),
        stderr = '',
        stdout = '',
        error;

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
        if (!error) {
            callback(null, code, stdout, stderr);
        } else {
            callback(new Error('could not spawn iconv (' + error.message + ')'));
        }
    });
}

function getVersion(executable, callback) {
    exec(executable, ['--version'], function (err, code, stdout) {
        if (err) {
            callback(err);
        } else if (code !== 0) {
            callback(new Error('iconv exited with code ' + code));
        } else {
            var matches = stdout.match(/^iconv (?:.+?) (\d+\.\d+(?:\.\d+)?).*$/m);
            callback(null, matches ? matches[1] : '<unknown>');
        }
    });
}

function getSupportedEncodings(executable, linefeed, callback) {
    exec(executable, ['--list'], function (err, code, stdout) {
        if (err) {
            callback(err);
        } else if (code !== 0) {
            callback(new Error('iconv exited with code ' + code));
        } else {
            callback(null, stdout.trim().split(linefeed));
        }
    });
}

function assertEncodingSupport(executable, encoding, linefeed, callback) {
    getSupportedEncodings(executable, linefeed, function (err, encodings) {
        if (err) {
            callback(err);
            return;
        }

        if (encodings.indexOf(encoding) < 0 && encodings.indexOf(encoding + '//') < 0) {
            callback(new Error('iconv does not support encoding "' + encoding + '"'));
        } else {
            callback();
        }
    });
}

function run(executable, file, encoding, callback) {
    exec(executable, ['--from-code', encoding, file], function (err, code, stdout, stderr) {
        if (err) {
            callback(new Error('could not check encoding with iconv (' + err.message + ')'));
        } else if (code === 0) {
            callback(null, true);
        } else {
            var messages = stderr.trim().split('\n').map(function (message) {
                var msg = message.match(/^[^:]+: (.+)$/);
                return msg ? msg[1] : message;
            });
            callback(null, false, messages);
        }
    });
}

module.exports = {
    exec: exec,
    getVersion: getVersion,
    getSupportedEncodings: getSupportedEncodings,
    assertEncodingSupport: assertEncodingSupport,
    run: run
};
