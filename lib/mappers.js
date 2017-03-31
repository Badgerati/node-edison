'use strict';

var TimeSpan = require('timespan');
var Checkers = require('./checkers');
var Helpers = require('./helpers');
var States = require('./enums/states');

module.exports = Mappers;


function Mappers() { }

Mappers.mapState = function(state, stage) {
    if (Checkers.isEmpty(stage)) {
        return States.Unknown;
    }

    if (state === States.Success
        || state === States.Inconclusive
        || state === States.Ignored
        || state === States.Unknown) {
        return state;
    }

    if (stage.toLocaleLowerCase() == 'test'.toLocaleLowerCase()) {
        return state;
    }

    return States.get(`${stage}${state.key}`);
}

Mappers.mapAbsoluteState = function(state) {
    switch (state) {
        case States.SetupError:
        case States.TeardownError:
        case States.TestFixtureSetupError:
            return States.Error;

        case States.SetupFailure:
        case States.TeardownFailure:
        case States.TestFixtureSetupFailure:
            return States.Failure;

        default:
            return state;
    }
}

Mappers.getDotStateValue = function(state) {
    switch (state) {
        case 'Success':
            return '.';

        case 'Inconclusive':
            return 'I';

        case 'Ignored':
            return 'S';

        case 'Error':
            return 'E';

        default:
            return 'F';
    }
}

Mappers.getTextStateValue = function(result) {
    var error = '';
    var trail = `\n\n${Helpers.getDoubleLines()}\n\n`;

    if (result.state != States.Success) {
        error = `\n\nError Message: ${result.error}\n\nStackTrace:\n${result.stack}`;
    }

    return `File: ${result.file}\nTest: ${result.name}\nState: ${result.state}\nDuration: ${result.duration}ms${error}${trail}`;
}

Mappers.getDurationString = function(duration) {
    var ts = TimeSpan.fromMilliseconds(duration || 0);

    ts.format = function(ts) {
        return `${ts.days}d ${ts.hours}h ${ts.minutes}m ${ts.seconds}s ${ts.milliseconds}ms`;
    }

    return ts.toString();
}