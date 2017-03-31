'use strict';

var _ = require('lodash');
var States = require('./enums/states');
var Checkers = require('./checkers');
var Helpers = require('./helpers');

module.exports = Assert;


function Assert() {

    Assert.prototype.fail = function(msg) {
        throwError((msg || 'Test marked as failure'), States.Failure);
    }

    Assert.prototype.pass = function(msg) {
        throwError((msg || 'Test marked as passed'), States.Success);
    }

    Assert.prototype.inconclusive = function(msg) {
        throwError((msg || 'Test marked as inconclusive'), States.Inconclusive);
    }


    Assert.prototype.areEqual = function(expected, actual, msg) {
        if (expected !== actual) {
            createErrorResponse.call(this, msg, null, expected, null, null, actual, null);
        }

        return this;
    }

    Assert.prototype.areNotEqual = function(expected, actual, msg) {
        if (expected === actual) {
            createErrorResponse.call(this, msg, 'Not ', expected, null, null, actual, null);
        }

        return this;
    }


    Assert.prototype.areArraysEqual = function(expected, actual, msg) {
        if (expected == null && actual == null) {
            return this;
        }

        if (expected == null || actual == null || expected.length != actual.length) {
            createErrorResponse.call(this, msg, null, expected, null, null, actual, null);
        }

        _.forEach(expected, (v, i) => {
            if (v !== actual[i]) {
                createErrorResponse.call(this, msg, null, expected, null, null, actual, null);
            }
        });

        return this;
    }

    Assert.prototype.areArraysNotEqual = function(expected, actual, msg) {
        if (expected == null && actual == null) {
            createErrorResponse.call(this, msg, 'Not ', expected, null, null, actual, null);
        }

        if (expected == null || actual == null || expected.length != actual.length) {
            return this;
        }

        var notEqual = true;

        _.some(expected, (v, i) => {
            notEqual = (v !== actual[i]);
            return notEqual;
        });

        if (!notEqual) {
            createErrorResponse.call(this, msg, 'Not ', expected, null, null, actual, null);
        }

        return this;
    }


    Assert.prototype.isInstanceOf = function(value, type, msg) {
        if (!(value instanceof type)) {
            createErrorResponse.call(this, msg, 'Instance of ', type.name, null, null, Checkers.getType(value), null);
        }

        return this;
    }

    Assert.prototype.isNotInstanceOf = function(value, type, msg) {
        if (value instanceof type) {
            createErrorResponse.call(this, msg, 'Not instance of ', type.name, null, null, Checkers.getType(value), null);
        }

        return this;
    }


    Assert.prototype.isNull = function(value, msg) {
        if (!Checkers.isNull(value)) {
            createErrorResponse.call(this, msg, null, null, null, null, value, null);
        }

        return this;
    }

    Assert.prototype.isNotNull = function(value, msg) {
        if (Checkers.isNull(value)) {
            createErrorResponse.call(this, msg, 'Not ', null, null, null, value, null);
        }

        return this;
    }


    Assert.prototype.isUndefined = function(value, msg) {
        if (!Checkers.isUndefined(value)) {
            createErrorResponse.call(this, msg, null, undefined, null, null, value, null);
        }

        return this;
    }

    Assert.prototype.isNotUndefined = function(value, msg) {
        if (Checkers.isUndefined(value)) {
            createErrorResponse.call(this, msg, 'Not ', undefined, null, null, value, null);
        }

        return this;
    }


    Assert.prototype.isNullOrUndefined = function(value, msg) {
        if (!Checkers.isNullOrUndefined(value)) {
            createErrorResponse.call(this, msg, null, 'NULL or UNDEFINED', null, null, value, null);
        }

        return this;
    }

    Assert.prototype.isNotNullOrUndefined = function(value, msg) {
        if (Checkers.isNullOrUndefined(value)) {
            createErrorResponse.call(this, msg, 'Not ', 'NULL or UNDEFINED', null, null, value, null);
        }

        return this;
    }


    Assert.prototype.isZero = function(value, msg) {
        if (value != 0) {
            createErrorResponse.call(this, msg, null, 0, null, null, value, null);
        }

        return this;
    }

    Assert.prototype.isNotZero = function(value, msg) {
        if (value == 0) {
            createErrorResponse.call(this, msg, 'Not ', 0, null, null, value, null);
        }

        return this;
    }


    Assert.prototype.isEmpty = function(value, msg) {
        if (Checkers.isEmpty(value)) {
            return this;
        }

        createErrorResponse.call(this, msg, 'Empty: ', Checkers.getType(value), null, null, value, null);
    }

    Assert.prototype.isNotEmpty = function(value, msg) {
        if (!Checkers.isEmpty(value)) {
            return this;
        }

        createErrorResponse.call(this, msg, 'Non-empty: ', Checkers.getType(value), null, null, value, null);
    }


    Assert.prototype.isGreaterThan = function(value, greaterThanThis, msg) {
        if (value == null || value <= greaterThanThis) {
            createErrorResponse.call(this, msg, 'Greater than ', greaterThanThis, null, null, value, null);
        }

        return this;
    }
    
    Assert.prototype.isNotGreaterThan = function(value, notGreaterThanThis, msg) {
        if (value == null || value > notGreaterThanThis) {
            createErrorResponse.call(this, msg, 'Not greater than ', notGreaterThanThis, null, null, value, null);
        }

        return this;
    }
    
    Assert.prototype.isGreaterThanOrEqual = function(value, greaterThanOrEqualToThis, msg) {
        if (value == null || value < greaterThanOrEqualToThis) {
            createErrorResponse.call(this, msg, 'Greater than or equal to ', greaterThanOrEqualToThis, null, null, value, null);
        }

        return this;
    }
    
    Assert.prototype.isNotGreaterThanOrEqual = function(value, notGreaterThanOrEqualToThis, msg) {
        if (value == null || value >= notGreaterThanOrEqualToThis) {
            createErrorResponse.call(this, msg, 'Not greater than or equal to ', notGreaterThanOrEqualToThis, null, null, value, null);
        }

        return this;
    }


    Assert.prototype.isLessThan = function(value, lessThanThis, msg) {
        if (value == null || value >= lessThanThis) {
            createErrorResponse.call(this, msg, 'Less than ', lessThanThis, null, null, value, null);
        }

        return this;
    }
    
    Assert.prototype.isNotLessThan = function(value, notLessThanThis, msg) {
        if (value == null || value < notLessThanThis) {
            createErrorResponse.call(this, msg, 'Not less than ', notLessThanThis, null, null, value, null);
        }

        return this;
    }
    
    Assert.prototype.isLessThanOrEqual = function(value, lessThanOrEqualToThis, msg) {
        if (value == null || value > lessThanOrEqualToThis) {
            createErrorResponse.call(this, msg, 'Less than or equal to ', lessThanOrEqualToThis, null, null, value, null);
        }

        return this;
    }
    
    Assert.prototype.isNotLessThanOrEqual = function(value, notLessThanOrEqualToThis, msg) {
        if (value == null || value <= notLessThanOrEqualToThis) {
            createErrorResponse.call(this, msg, 'Not less than or equal to ', notLessThanOrEqualToThis, null, null, value, null);
        }

        return this;
    }


    Assert.prototype.startsWith = function(value, startsWithThis, msg) {
        if (value == null || !value.startsWith(startsWithThis)) {
            createErrorResponse.call(this, msg, 'Starts with: ', startsWithThis, null, null, value, null);
        }

        return this;
    }
    
    Assert.prototype.doesNotStartWith = function(value, doesNotStartWithThis, msg) {
        if (value != null || value.startsWith(doesNotStartWithThis)) {
            createErrorResponse.call(this, msg, 'Does not start with: ', doesNotStartWithThis, null, null, value, null);
        }

        return this;
    }


    Assert.prototype.endsWith = function(value, endsWithThis, msg) {
        if (value == null || !value.endsWith(endsWithThis)) {
            createErrorResponse.call(this, msg, 'Ends with: ', endsWithThis, null, null, value, null);
        }

        return this;
    }
    
    Assert.prototype.doesNotEndWith = function(value, doesNotEndWithThis, msg) {
        if (value != null || value.endsWith(doesNotEndWithThis)) {
            createErrorResponse.call(this, msg, 'Does not end with: ', doesNotEndWithThis, null, null, value, null);
        }

        return this;
    }


    Assert.prototype.isMatch = function(value, regex, msg) {
        if (!Checkers.isMatch(value, regex)) {
            createErrorResponse.call(this, msg, 'Matches: ', regex, null, null, value, null);
        }

        return this;
    }

    Assert.prototype.isNotMatch = function(value, regex, msg) {
        if (Checkers.isMatch(value, regex)) {
            createErrorResponse.call(this, msg, 'Does not match: ', regex, null, null, value, null);
        }

        return this;
    }


    Assert.prototype.isBetween = function(value, lowerBound, upperBound, msg) {
        if (value == null || value < lowerBound || value > upperBound) {
            createErrorResponse.call(this, msg, 'Between: ', `${lowerBound} and ${upperBound}`, null, null, value, null);
        }

        return this;
    }

    Assert.prototype.isNotBetween = function(value, lowerBound, upperBound, msg) {
        if (value != null && (value >= lowerBound && value <= upperBound)) {
            createErrorResponse.call(this, msg, 'Not between: ', `${lowerBound} and ${upperBound}`, null, null, value, null);
        }

        return this;
    }


    Assert.prototype.contains = function(value, containsThis, msg) {
        if (!Checkers.contains(value, containsThis)) {
            createErrorResponse.call(this, msg, 'Contains: ', containsThis, null, null, value, null);
        }

        return this;
    }

    Assert.prototype.doesNotContain = function(value, doesNotContainThis, msg) {
        if (Checkers.contains(value, doesNotContainThis)) {
            createErrorResponse.call(this, msg, 'Does not contain: ', doesNotContainThis, null, null, value, null);
        }

        return this;
    }




    ////////////////////////////////
    // PRIVATE HELPERS
    ////////////////////////////////
    function createErrorResponse(preMsg, preExpected, expected, postExpected, preActual, actual, postActual) {
        if (expected && (typeof expected !== 'string') && expected.length > 0) {
            expected = buildEnumerableString(expected);
        }

        if (actual && (typeof actual !== 'string') && actual.length > 0) {
            actual = buildEnumerableString(actual);
        }

        if (preExpected && !preActual) {
            preActual = (new Array(preExpected.length + 1)).join(' ');
        }

        var msg = `${(preMsg || 'Test assertion failed')}`;
        var exptdMsg = `Expected:\t${(preExpected || '') + Helpers.toNullUndefinedString(expected) + (postExpected || '')}`;
        var actualMsg = `But was:\t${(preActual || '') + Helpers.toNullUndefinedString(actual) + (postActual || '')}`;

        throwError(`${msg}\n${exptdMsg}\n${actualMsg}`);
    }

    function throwError(msg, state) {
        throw {
            assert_error: msg,
            stack: (new Error()).stack,
            state: state
        }
    }

    function buildEnumerableString(enumerable) {
        var str = '';

        _.forEach(enumerable, (v, i) => {
            str += v;

            if (i != enumerable.length - 1) {
                str += ', ';
            }
        });

        return str.replace('\r').replace('\n', '').trim();
    }

}