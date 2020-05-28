/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = ['tests/functional/sign_in.js'];

// Mocha tests are only exposed during local dev, not on prod-like
// instances such as latest, stable, stage, and prod. To avoid
// Teamcity failing trying to run mocha tests, expose an environment
// variable it can use to skip the mocha tests.
if (!process.env.SKIP_MOCHA) {
  module.exports.unshift('tests/functional/mocha.js');
}
