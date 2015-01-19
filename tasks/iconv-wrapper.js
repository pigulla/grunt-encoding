'use strict';

var path = require('path'),
    spawn = require('child_process').spawn,
    util = require('util');

function exec(executable, args, callback) {
    var process = spawn(executable, args),
        stderr = '',
        stdout = '',
        error;

    process.stdout.on('data', function (data) {
        stdout += data.toString();
    });
    process.stderr.on('data', function (data) {
        stderr += data.toString();
    });
    process.on('error', function (err) {
        error = err;
    });
    process.on('close', function (code) {
        if (!error) {
            callback(null, code, stdout, stderr);
        } else {
            var message = util.format('could not spawn "%s" ("%s")', executable, error.message);
            callback(new Error(message));
        }
    });

    return process;
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

function assertEncodingSupport(executable, encoding, callback) {
    if (!encoding) {
        callback(new Error('no encoding specified'));
        return;
    }
    
    var process = exec(executable, ['--from-code', encoding], function (error, code) {
        if (error) {
            callback(error);
        } else if (code !== 0) {
            callback(new Error('iconv does not support encoding "' + encoding + '"'));
        } else {
            callback();
        }
    });

    process.stdin.end('');
}

function check(executable, file, encoding, callback) {
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
    assertEncodingSupport: assertEncodingSupport,
    check: check
};
