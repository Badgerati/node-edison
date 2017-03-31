/*******************************************************************************************
 * The purpose of this example is to give a brief overview of how to use the basics
 * of Edison:
 *
 * - Import the module and create an instance
 * - Basic test creation
 * - Ignoring a test
 * - Test cases
 * - Expected throw errors
 *******************************************************************************************/

// first, import and create an Edison instance.
// or just "require('node-edison');" if installed via npm
var edison = require('../lib/edison.js').create();


// next, create a basic test.
// test(<name>, [<opts>], <func>) takes a mandatory name and logic function,
// with optional opts collection.
// the logic function is passed an assert library (a), and a done function that
// needs to be called once your test has finished; not calling done() will hang the framework
edison.test('test-name', function(a, done) {
    var x = 3;
    a.areEqual(3, x);
    done();
});

// the done function helps Edison to know when your test is finished
// such as when your test might have async components (and this is node, so it will :P).
edison.test('test-name-2', (a, d) => {
    var x = 1;
    setTimeout(function() {
        a.areEqual(1, x);
        d();
    }, 1000);
});


// here's an example with the opts collection, which ignores a test
edison.test('ignore-test', { ignore: true}, (a, d) => {
    var arr = [1, 2, 3];
    a.contains(arr, 2);
    d();
});


// you can also specify test-cases
// this will run the test twice, with x=1 and x=2
// when using cases, a third argument will be passed to the logic function, which is the current case
edison.test('test-cases', { cases: [ { x: 1 }, { x: 2 } ] }, (a, d, tc) => {
    var y = 1 + tc.x;
    a.isBetween(y, 1, 5);
    d();
});


// you can also expect your test to throw an error,
// or expect an error message matching some regex
edison.test('expect-error', { throws: TypeError }, (a, d) => {
    throw new TypeError('example'); // test passes as error type expected
    d(); // technically not needed, but normally you wouldn't throw in a test anyway!
});

edison.test('expect-error-msg', { throws: /example/ }, (a, d) => {
    throw new SyntaxError('example'); // test passes as error message is expected
    d();
});


// finally, to actually run the tests, you need to call run
// all tests by default are run synchrounously
// to run set some tests to run async, pass opt: { async: true }
// to run the whole file in async, use create opt: { sync_type: 'async' }
edison.run();

// to run this file, just type the following on a CLI:
// > node examples/quick-start.test.js
//
// or use the binary to run everything:
// > node bin/edison examples/*.test.js
