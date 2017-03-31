'use strict';

var _ = require('lodash');
var Moment = require('moment');
var States = require('./enums/states');
var Helpers = require('./helpers');
var Mappers = require('./mappers');
var Checkers = require('./checkers');


module.exports = Results;

function Results(console_output_type) {
    var _console_output_type = (console_output_type || 'plain');
    var _results = new Array();

    Results.prototype.create = function(test, err, stage, file) {
        // format the error
        err = Helpers.parseErrorObject(err);

        // if test was a case, format the name
        var parameters = Helpers.toParameterString(test.testcase);
        var test_name = `${test.name}(${parameters})`;

        // get the true state
        var state = Mappers.mapState((err ? err.state : States.Success), stage);
        var abs_state = Mappers.mapAbsoluteState(state);

        // create result object
        return {
            name: test_name,
            error: (err ? err.error : null),
            stack: (err ? err.stack : null),
            state: state.key,
            abs_state: abs_state.key,
            file: file,
            date: Moment().format(),
            duration: 0
        };
    }

    Results.prototype.add = function(result) {
        _results.push(result);
    }

    Results.prototype.log = function(result, opts) {
        if (!result) {
            return;
        }

        this.add(result);

        if (_console_output_type === 'dot') {
            Helpers.log(Mappers.getDotStateValue(result.abs_state));
        }
        else {
            if (result.abs_state !== States.Success.key) {
                Helpers.log(Mappers.getTextStateValue(result));
            }
        }

        // send result to url
        opts = opts || {};
        if (!Checkers.isEmpty(opts.test_result_url)) {

        }

        // send result to slack
        if (!Checkers.isEmpty(opts.slack_token)
            && !Checkers.isEmpty(result.slack_channel)
            && result.state != States.Success.key) {

        }
    }

    Results.prototype.countAbs = function(abs_state) {
        return _.filter(_results, (r) => {
            return (r.abs_state === abs_state.key);
        }).length;
    }

    Results.prototype.finalLog = function(duration) {
        // if dot format, output details of failed tests
        if (_console_output_type === 'dot') {
            var fails = _.filter(_results, (r) => {
                return (r.abs_state !== States.Success.key && r.abs_state !== States.Ignored.key);
            });

            if (fails.length > 0) {
                Helpers.log(`\n\n${Helpers.getDoubleLines()}\n\n`);

                fails.forEach((v) => {
                    Helpers.log(Mappers.getTextStateValue(v));
                });
            }
        }

        // output stats
        var total = _results.length;
        var success = this.countAbs(States.Success);
        var fail = this.countAbs(States.Failure);
        var error = this.countAbs(States.Error);
        var incon = this.countAbs(States.Inconclusive);
        var ignore = this.countAbs(States.Ignored);

        var sucRate = Helpers.getRatio(success, total);
        var failRate = Helpers.getRatio((fail + error), total);

        Helpers.log(`\n\n${Helpers.getDoubleLines()}\n`);
        Helpers.log(`Total: ${total}, Passed: ${success}, Failed: ${fail}, Errored: ${error}, Inconclusive: ${incon}, Skipped: ${ignore}\n`);
        Helpers.log(`Success Rate: ${sucRate}\nFailure Rate: ${failRate}\n`);
        Helpers.log(`Duration: ${Mappers.getDurationString(duration)}`)
        Helpers.log(`\n${Helpers.getDoubleLines()}\n`);

        return (success === total ? 0 : 1);
    }
}

