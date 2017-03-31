'use strict';

var _ = require('lodash');
var Checkers = require('./checkers');
var States = require('./enums/states');

module.exports = Helpers;


function Helpers() { }

Helpers.getOptsDefault = function() {
    return {
        async: false,
        skip: false,
        ignore: false,
        cases: null,
        throws: null
    };
}

Helpers.filterArgs = function(_name, _opts, _callback) {
    var name, opts, callback;

    for (var i = 0; i < arguments.length; i++) {
        var _arg = arguments[i];
        var _t = typeof _arg

        if (_t === 'string') {
            name = _arg;
        }
        else if (_t === 'object') {
            opts = (_arg || Helpers.getOptsDefault());
        }
        else if (_t === 'function') {
            callback = _arg
        }
    }

    var file = Helpers.getFileName((new Error()).stack);

    return {
        name: name,
        file: file,
        opts: (opts || Helpers.getOptsDefault()),
        callback: callback
    };
}

Helpers.getFileName = function(stack) {
    if (!stack) {
        stack = (new Error()).stack;
    }

    var split = stack.split('\n');
    if (!split || split.length < 3) {
        return '';
    }

    var line = split[3].trim();
    var regex = new RegExp(/.*\((.*?\.js).*?/);
    var groups = line.match(regex);

    return groups.length != 2 ? '' : groups[1].trim().replace(process.cwd(), '.');
}

Helpers.parseErrorObject = function(err) {
    if (!err || err.state == States.Success) {
        return null;
    }

    var msg;
    var stack = (new Error()).stack;
    var state = States.Error;

    if (err.assert_error && !Checkers.isEmpty(err.assert_error)) {
        msg = err.assert_error;
        stack = err.stack;
        state = (err.state || States.Failure);
    }
    else if ((typeof err) === 'string') {
        msg = err.trim();
        state = States.Failure;
    }
    else if (err.stack != null) {
        msg = err.message;
        stack = err.stack;
    }
    else if (!Checkers.isEmpty(err.message)) {
        msg = err.message;
    }
    else {
        msg = 'Test assertion has failed';
    }

    return {
        error: msg,
        stack: stack,
        state: state
    };
}

Helpers.log = function(msg) {
    process.stdout.write(msg);
}

Helpers.getDoubleLines = function() {
    return '= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =';
}

Helpers.toNullUndefinedString = function(value) {
    if (value === null) {
        return 'NULL';
    }
    else if (value === undefined) {
        return 'UNDEFINED';
    }

    return value;
}

Helpers.toParameterString = function(parameters) {
    if (Checkers.isEmpty(parameters)) {
        return '';
    }

    return JSON.stringify(parameters);
}

Helpers.getRatio = function(value, total) {
    if (value == 0) {
        return '0.0';
    }

    if (value == total) {
        return '1.0';
    }

    return Math.round((value / total) * 100) / 100;
}