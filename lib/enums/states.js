'use strict';

var Enum = require('enum');

module.exports = new Enum([
    // general
    'Success',
    'Failure',
    'Error',
    'Inconclusive',
    'Ignored',

    // setup
    'SetupError',
    'SetupFailure',

    // teardown
    'TeardownError',
    'TeardownFailure',

    // test fixture setup
    'TestFixtureSetupError',
    'TestFixtureSetupFailure',

    // unknown
    'Unknown'
]);