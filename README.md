# Edison for Node.js (Alpha)

This is the Node.js version of Edison, if you're after the .NET version go [here](https://github.com/Badgerati/Edison).

This is still in alpha, so use at own risk. Though from testing it's pretty reliable.

## Features

* Framework with Assert class for writing unit/integration tests.
* Allows you to have setup/teardown for each test-file, as well as each test.
* Can run tests async or sync.
* CLI binary to run multiple test-files.
* Able to have multiple test-cases for tests.
* Ability to store versioned console parameters in an Edisonfile.

## Usage

See the `examples/quick-start.test.js`, and other files in `examples`, for usages.

Quick example:

```js
var edison = require('../lib/edison.js').create();

edison.test('test-name', function(assert, done) {
    var x = 3;
    assert.areEqual(3, x); // will fail if x is not 3
    done(); // must be called at a point where the test will have succesfully ended
});

edison.run();
```

and to run:

```batch
node bin\edison examples\*.tests.js
```

or if you're using an Edisonfile, just:

```batch
node bin\edison
```

An example of the output in 'dot' format on the CLI is:

```batch
.......

= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
Total: 7, Passed: 7, Failed: 0, Errored: 0, Inconclusive: 0, Skipped: 0
Success Rate: 1.0
Failure Rate: 0.0
Duration: 0d 0h 0m 1s 19ms
= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
```

where the fullstops at the top indicate tests that have passed. Failed tests will appear as either 'F' or 'E' (Failed or Errored). Any tests that fail will be displayed after all tests have run. If any tests have failed the process will return with an exit code of 1, otherwise 0 for success.

## Edisonfile

The `Edisonfile` allows you to save, and version control, the arguments that you can supply to the binary. The file is of YAML format and should be saved at the root of your repository.
The following is an example of the format:

```yaml
tests:
  - tests\*.tests.js

disable_console_output: true
console_output_type: dot
sync_type: async
```

To use, just run run the `edison` binary at the root, with no arguments supplied. The framework will locate the Edisonfile and populate the parameters accordingly.

For example, the above will be just like running:

```batch
node bin\edison tests\*.tests.js --dco --cot dot --st async
```

## Bugs and Feature Requests

For any bugs you may find or features you wish to request, please create an [issue](https://github.com/Badgerati/node-edison/issues "Issues") in GitHub.


### TODO

* Write results to file
* Send results to URL
* Send results to Slack
* Re-run failed tests
* Ability to set categories against tests, and to be able to include/exclude by category

