/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import convict from 'convict';
import fs from 'fs';
import path from 'path';

const conf = convict({
  database: {
    database: {
      default: 'fxa',
      doc: 'MySQL database',
      env: 'TYPEORM_DATABASE',
      format: String
    },
    host: {
      default: 'localhost',
      doc: 'MySQL host',
      env: 'TYPEORM_HOST',
      format: String
    },
    password: {
      default: '',
      doc: 'MySQL password',
      env: 'TYPEORM_PASSWORD',
      format: String
    },
    port: {
      default: 3306,
      doc: 'MySQL port',
      env: 'TYPEORM_PORT',
      format: Number
    },
    user: {
      default: 'root',
      doc: 'MySQL username',
      env: 'TYPEORM_USERNAME',
      format: String
    }
  },
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production']
  },
  log: {
    app: {
      default: 'fxa-graphql-server',
      env: 'LOG_APP_NAME'
    },
    fmt: {
      default: 'heka',
      env: 'LOG_FORMAT',
      format: ['heka', 'pretty']
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL'
    }
  },
  metrics: {
    host: {
      default: 'localhost',
      doc: 'Metrics host to report to',
      env: 'METRIC_HOST',
      format: String
    },
    port: {
      default: 8125,
      doc: 'Metric port to report to',
      env: 'METRIC_PORT',
      format: Number
    },
    prefix: {
      default: 'fxa-event-broker.',
      doc: 'Metric prefix for statsD',
      env: 'METRIC_PREFIX',
      format: String
    },
    telegraf: {
      default: true,
      doc: 'Whether to use telegraf formatted metrics',
      env: 'METRIC_USE_TELEGRAF',
      format: Boolean
    }
  },
  proxy: {
    port: {
      default: 8090,
      doc: 'Port to run PubSub proxy on',
      env: 'PUBSUB_PROXY_PORT',
      format: Number
    }
  },
  sentryDsn: {
    default: '',
    doc: 'Sentry DSN for error and log reporting',
    env: 'SENTRY_DSN',
    format: String
  }
});

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable.

// Need to move two dirs up as we're in the compiled directory now
const configDir = path.dirname(path.dirname(__dirname));
let envConfig = path.join(configDir, 'config', `${conf.get('env')}.json`);
envConfig = `${envConfig},${process.env.CONFIG_FILES || ''}`;
const files = envConfig.split(',').filter(fs.existsSync);
conf.loadFile(files);
conf.validate({ allowed: 'strict' });

const Config = conf;

export default Config;
