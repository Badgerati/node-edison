/*************************************************************
 * The purpose of this example is to show how to use the setup
 * and teardown functions in Edison
 *************************************************************/

// first, import and create an Edison instance.
var edison = require('../lib/edison.js').create();


// There are two kinds of setup functions in Edison:
// - "setup" which runs once for a test file
// - "setupEach" which runs once before each test in a file

// The setup function only needs a logic function passed
// this will then be called when a test file starts, and be supplied
// an assert library (a) and a done function, similar to tests
// There is no opts collection for setups.
edison.setup(function(a, done) {
    // do some first time setup and assertions here
    done();
});

// The setupEach function is the same format as the setup, except
// that it's called before each test runs in a file
edison.setupEach((a, done) => {
    // do some setup logic before each test
    done();
});



// some random tests
edison.test('test-name', (a, d) => { d(); });



// There are two kinds of teardown functions also, similar to setup:
// - "teardown" which runs once at the end of a test file
// - "teardownEach" which runs once after each test in a file

// The teardown functions are similar to that of the setup ones,
// however there is one key difference to teardown than setup:
// The teardown function does not have an assetion library passed
edison.teardown((done) => {
    // do some final teardown and clean up at the end of a test file
    done();
});

// The teardownEach does have a assertion library passed, but it also
// has the result of the test passed as well
edison.teardownEach((a, result, done) => {
    // do some teardown and clean up after each test
    a.areEqual(result.state, 'Success');
    done();
});


// and of course, run the tests
edison.run();
