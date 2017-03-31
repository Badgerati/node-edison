
var _ = require('lodash');

// export the checkers module
module.exports = new Checkers();


// basic constructor
function Checkers() { }


Checkers.prototype.isEmpty = function(value) {
    return (this.isNullOrUndefined(value)
        || value.length === 0
        || value.size === 0
        || value.count === 0);
}


Checkers.prototype.isInstanceOf = function(value, type) {
    return (value instanceof type);
}


Checkers.prototype.isType = function(value, type) {
    type = type.toLowerCase();
    return (typeof value === type || this.getType(value, true) === type);
}

Checkers.prototype.getType = function(value, lowercase) {
    var name = value && value.constructor
        ? value.constructor.name
        : ({}).toString.call(value).match(/\s([^\]]+)/)[1];

    return (lowercase ? name.toLowerCase() : name);
}


Checkers.prototype.isBoolean = function(value) {
    return (value === false || value === true);
}

Checkers.prototype.isArray = function(value) {
    return this.isType(value, 'array');
}

Checkers.prototype.isString = function(value) {
    return this.isType(value, 'string');
}

Checkers.prototype.isObject = function(value) {
    return this.isType(value, 'object');
}

Checkers.prototype.isNumber = function(value) {
    return this.isType(value, 'number');
}

Checkers.prototype.isRegExp = function(value) {
    return this.isType(value, 'regexp');
}


Checkers.prototype.isNumeric = function(value) {
    if (this.isNumber(value)) {
        value = value.toString();
    }

    return this.isRegex(value, /^\d+$/);
}

Checkers.prototype.isDecimal = function(value) {
    if (this.isNumber(value)) {
        value = value.toString();
    }

    return this.isRegex(value, /^[\.\d]+$/);
}

Checkers.prototype.isAlpha = function(value) {
    return this.isRegex(value, /^[a-zA-Z]+$/);
}

Checkers.prototype.isAlphaNumeric = function(value) {
    return this.isRegex(value, /^[a-zA-Z\d]+$/);
}

Checkers.prototype.isEmail = function(value) {
    return this.isRegex(value, /^.*?@.*?\..*?$/);
}

Checkers.prototype.isMatch = function(value, regex) {
    if (this.containsNullOrUndefined([value, regex])) {
        return false;
    }

    if (!this.isType(regex, 'regexp')) {
        regex = new RegExp(regex, 'g');
    }

    return regex.test(value);
}


Checkers.prototype.isNull = function(value) {
    return (value === null);
}

Checkers.prototype.isUndefined = function(value) {
    return (value === undefined);
}

Checkers.prototype.isNullOrUndefined = function(value) {
    return (value === null || value === undefined);
}


Checkers.prototype.isInstanceOf = function(value, type) {
    return (value instanceof type);
}


Checkers.prototype.contains = function(value, lookup) {
    if (this.isNullOrUndefined(value)) {
        return false;
    }

    if (this.isString(value)) {
        return (value.indexOf(lookup) !== -1);
    }

    var found = false;

    _.some(value, (v) => {
        found = (v === lookup);
        return found;
    });

    return found;
}

Checkers.prototype.containsNull = function(value) {
    return this.contains(value, null);
}

Checkers.prototype.containsUndefined = function(value) {
    return this.contains(value, undefined);
}

Checkers.prototype.containsNullOrUndefined = function(value) {
    return (this.containsNull(value) || this.containsUndefined(value));
}