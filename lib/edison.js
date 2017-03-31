'use strict';

// require modules
var _ = require('lodash');
var Checkers = require('./checkers');
var Async = require('async');
var Moment = require('moment');
var Assert = require('./assert');
var Helpers = require('./helpers');
var Results = require('./results');


// export the Edison module
module.exports = Edison;


// Edison constructor, and inner core functions
function Edison(opts) {
    // suppress console.log
    if (opts.disable_console_output) {
        console.log = console.info = function() {
            return;
        }
    }

    // general information for tests, as well as array of test bodies for async
    var _testNames = new Map();
    var _tests = new Map();

    // test results
    var _results = new Results(opts.console_output_type);

    // file options
    var _options = new Map();

    // before calls
    var _setup = new Map();
    var _setupEach = new Map();

    // after calls
    var _teardown = new Map();
    var _teardownEach = new Map();


    // function to use when creating tests
    Edison.prototype.test = function(name, opts, callback) {
        var args = Helpers.filterArgs(name, opts, callback);

        // if no test name, error
        if (Checkers.isEmpty(args.name)) {
            throw 'Test name must be supplied.'
        }

        // if no callback test logic, error
        if (args.callback == null) {
            throw `No callback test logic has been supplied for "${args.fullname}".`
        }

        // if options to skip/ignore, return
        if (args.opts.skip || args.opts.ignore) {
            return;
        }

        // check if a file has already been added to the map of tests to run
        if (!_tests.has(args.file)) {
            _tests.set(args.file, new Array());
            _testNames.set(args.file, new Set());
        }

        // function to check whether a test already has the same name for the current test file
        var checkNameExists = function(file, name) {
            if (_testNames.get(file).has(name)) {
                throw `Test with name "${name}" already exists in "${file}".`
            }
            else {
                _testNames.get(file).add(name);
            }
        }

        // determine if we're using test cases or not
        if (args.opts.cases && args.opts.cases.length > 0) {
            var _name;

            args.opts.cases.forEach((v, i) => {
                _name = `${args.name}_${i}`;
                checkNameExists(args.file, _name);

                _tests.get(args.file).push({
                    name: args.name,
                    file: args.file,
                    fullname: args.fullname,
                    opts: args.opts,
                    callback: args.callback,
                    testcase: v
                });
            });
        }
        else {
            checkNameExists(args.file, args.name);
            _tests.get(args.file).push(args);
        }

        return this;
    }


    // function to use to run setup logic before all tests
    Edison.prototype.setup = function(callback) {
        if (callback == null) {
            throw `No callback for setup logic has been supplied.`
        }

        addSetupTeardown.call(this, Helpers.getFileName(), _setup, 'Setup', callback);
        return this;
    }


    // function to use to run teardown logic after all tests
    Edison.prototype.teardown = function(callback) {
        if (callback == null) {
            throw `No callback for teardown logic has been supplied.`
        }

        addSetupTeardown.call(this, Helpers.getFileName(), _teardown, 'Teardown', callback);
        return this;
    }


    // function to use to run setup logic before each test
    Edison.prototype.setupEach = function(callback) {
        if (callback == null) {
            throw `No callback for setupEach logic has been supplied.`
        }

        addSetupTeardown.call(this, Helpers.getFileName(), _setupEach, 'SetupEach', callback);
        return this;
    }


    // function to use to run teardown logic after each test
    Edison.prototype.teardownEach = function(callback) {
        if (callback == null) {
            throw `No callback for teardownEach logic has been supplied.`
        }

        addSetupTeardown.call(this, Helpers.getFileName(), _teardownEach, 'TeardownEach', callback);
        return this;
    }


    // function to help set more file specific options
    Edison.prototype.setOptions = function(file, optName, optValue) {
        if (!file || !optName || !optValue) {
            return this;
        }

        if (!_options.has(file)) {
            _options.set(file, new Map());
        }

        _options.get(file).set(optName, optValue);
        return this;
    }


    // final function call in a test file, to start to testing process
    Edison.prototype.run = function() {
        // if global run is populated, skip
        if (process.env.edison_global_run) {
            return;
        }

        // if no tests, just return
        if (Checkers.isEmpty(_tests)) {
            return;
        }

        // self
        var _self = this;

        // start global timer for total time taken
        var _start = new Moment();

        // filter tests (based on opts sync_type)
        var asyncTests, syncTests;

        // function to set the filter async/sync tests for a file
        var filterAsyncSyncTests = function(file) {
            var _fileTests = _tests.get(file);

            switch (_options.get(file).get('sync_type')) {
                case 'async':
                    asyncTests = _fileTests;
                    break;

                case 'sync':
                    syncTests = _fileTests;
                    break;

                default:
                    asyncTests = _.filter(_fileTests, (t) => {
                        return (t.opts.async === true);
                    });

                    syncTests = _.filter(_fileTests, (t) => {
                        return (!t.opts.async);
                    });
                    break;
            }
        }

        // run tests (auto-fail on setup-error)
        var runTests = function(file, se, done) {
            // first, run the async tests
            Async.each(asyncTests, (test, asyncDone) => {
                runTestFunc.call(_self, se, _setupEach, test, _teardownEach, asyncDone);
            },
            () => {
                // then, run the sync tests
                Async.eachSeries(syncTests, (test, syncDone) => {
                    runTestFunc.call(_self, se, _setupEach, test, _teardownEach, syncDone);
                },
                () => {
                    // finally, run the file's teardown
                    teardownFunc.call(_self, _teardown, file, done);
                });
            });
        }

        // synchrounousy run across the test files
        Async.eachSeries(_tests.keys(), (file, done) => {
            // filter tests async/sync
            filterAsyncSyncTests(file);

            // run file's setup, tests and teardown
            setupFunc.call(_self, _setup, file, done, runTests)
        },
        () => {
            var code = _results.finalLog((new Moment()).diff(_start));
            process.exit(code);
        });
    }


    ////////////////////////////////
    // PRIVATE HELPERS
    ////////////////////////////////

    // function to set the setup(each)/teardown(each) handlers
    function addSetupTeardown(file, map, name, callback) {
        if (map.has(file)) {
            throw `${name} for file ${file} already exists.`
        }

        map.set(file, callback);
    }

    // function to run setup before all tests, then when done (unless err) run tests
    function setupFunc(setup, file, done, tests) {
        if (!setup || !setup.has(file)) {
            tests(file, null, done);
            return;
        }

        try {
            setup.get(file)((new Assert()), (e) => {
                if (e) { throw e; }
                tests(file, null, done);
            });
        }
        catch (e) {
            tests(file, e, done);
        }
    }

    // function to run after all tests have run
    function teardownFunc(teardown, file, done) {
        if (!teardown || !teardown.has(file)) {
            done();
            return;
        }

        try {
            teardown.get(file)((e) => {
                if (e) { throw e; }
                done();
            });
        }
        catch (e) {
            Helpers.log(e);
            done();
        }
    }

    // function to run before each test has run
    function setupEachFunc(setupEach, file, done) {
        if (!setupEach || !setupEach.has(file)) {
            done();
            return;
        }

        try {
            setupEach.get(file)((new Assert()), (e) => {
                if (e) { throw e; }
                done();
            });
        }
        catch (e) {
            done(e);
        }
    }

    // function to run after each test has run
    function teardownEachFunc(teardownEach, file, result, done) {
        if (!teardownEach || !teardownEach.has(file)) {
            done();
            return;
        }

        try {
            teardownEach.get(file)((new Assert()), result, (e) => {
                if (e) { throw e; }
                done();
            });
        }
        catch (e) {
            done(e);
        }
    }

    // run a test case
    function runTestFunc(setupError, setupEach, test, afterEach, done) {
        // if the initial file setup failed, just report and done
        if (setupError) {
            var result = _results.create(test, setupError, 'TestFixtureSetup', test.file);
            _results.log(result, opts);
            done();
            return;
        }

        var _start = new Moment();

        // done function to be used after running a test (will auto-teardown and report errors)
        var doneFunc = function(te, se) {
            // create initial result object
            var result = null;

            if (te) {
                result = _results.create(test, te, 'Test', test.file);
            }
            else if (se) {
                result = _results.create(test, se, 'Setup', test.file);
            }
            else {
                result = _results.create(test, null, 'Test', test.file);
            }

            // attempt teardown, regardless of setup/test fail
            teardownEachFunc(afterEach, test.file, result, (tde) => {
                if (tde) {
                    result = _results.create(test, tde, 'Teardown', test.file);
                }

                result.duration = (new Moment()).diff(_start);
                _results.log(result, opts);

                // done
                done();
            });
        }

        // run each setup, test and teardown
        setupEachFunc(setupEach, test.file, (se) => {
            // if there's an error from setup, report and stop
            if (se) {
                doneFunc(null, se);
                return;
            }

            // attempt to run the test logic, followed by teardown
            try {
                test.callback((new Assert()), doneFunc, test.testcase);
            }
            catch (te) {
                // check to see if the test threw an expected error
                if (test.opts.throws && !te.assert_error) {
                    if (Checkers.isRegExp(test.opts.throws) && Checkers.isMatch(te, test.opts.throws)) {
                        te = null;
                    }
                    else if (Checkers.isInstanceOf(te, test.opts.throws)) {
                        te = null;
                    }
                }

                // run teardown and reporting logic
                doneFunc(te, null);
            }
        });
    }

}


// static function to create instance of Edison module
// the opts are optional, and will be defaulted
// if "process.env.edison_opts" is non-null they are used and override all other opts
Edison.create = function(opts) {
    // safeguard passed options
    opts = opts || {};
    var gopts = JSON.parse(process.env.edison_global_opts || '{}');

    // initial edison
    var e = null;

    // if a global edison already exists, use it
    if (exports.Edison != null) {
        var e = exports.Edison;
    }

    // else, we need to set one up
    else {
        // set options, and override with global options
        var _opts = {
            disable_console_output: (gopts.disable_console_output != null ? gopts.disable_console_output : (opts.disable_console_output == false ? false : true)),
            console_output_type: (gopts.console_output_type || opts.console_output_type || 'dot').toLocaleLowerCase(),
            test_result_url: (gopts.test_result_url || opts.test_result_url),
            test_run_id: (gopts.test_run_id || opts.test_run_id),
            test_run_name: (gopts.test_run_name || opts.test_run_name),
            test_run_env: (gopts.test_run_env || opts.test_run_env),
            test_run_project: (gopts.test_run_project || opts.test_run_project),
            slack_token: (gopts.slack_token || opts.slack_token)
        };

        // create new edison instance
        var e = new Edison(_opts);
        exports.Edison = e;
    }

    // get current file name
    var file = Helpers.getFileName();

    // specific options
    var syncType = (gopts.sync_type || opts.sync_type || 'default').toLocaleLowerCase();
    e.setOptions(file, 'sync_type', syncType);

    // set instance globally and return
    return e;
}