
var edison = require('./lib/edison.js').create({ sync_type: 'sync' });


edison.test('example', { throws: TypeError }, function(a, done) {
    //console.log('here1');
    //a.areEqual(1, 1).areEqual(1, 2);
    //a.areArraysNotEqual([1,2], [1,2]);
    //a.isMatch('12a', /^\d+$/);
    throw new TypeError('help');
    //console.log('here1 - 2');
    done();
});

edison.test('example2', function(a, done) {
    //console.log('here2');
    done();
});

edison.test('example3', function(a, done) {
    //console.log('here3');
    done();
});

edison.test('example4', { async: true }, function(a, done) {
    setTimeout(function() {
        //console.log('here4');
        done();
    }, 1000);
});

edison.test('example5', { async: true }, function(a, done) {
    //console.log('here5');
    done();
});

edison.test('example6', function(a, done) {
    //console.log('here6');
    done();
});

edison.test('case-example', { cases: [ { x: 1 }, { x: 2 } ]}, function(a, done, tc) {
    //console.log(`x = ${tc.x}`);
    a.areEqual(1, tc.x);
    done();
});

edison.setup(function(a, done) {
    //console.log('before');
    //throw new Error('hello');
    //a.areEqual(1, 2);
    done();
});

edison.teardown(function(done) {
    //console.log('after');
    done();
});

edison.run();