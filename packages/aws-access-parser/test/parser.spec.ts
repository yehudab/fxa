/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert as cassert } from 'chai';
import 'mocha';

import { parseLogline, ParsedLine } from '../src/parser';

const VALID_LOG_LINE =
  '2017-06-05T23:55:32.954546Z fxa-conte-ContentS 00.00.00.00:52878 172.00.00.00:80 0.000072 0.004025 0.000048 200 200 0 1537 "GET https://accounts.stage.mozaws.net:443/settings HTTP/1.1" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0 FxATester/1.0" ECDHE-RSA-AES128-GCM-SHA256 TLSv1.2';
const PARSED_VALID_LOG_LINE: ParsedLine = {
  backend: '172.00.00.00',
  backend_processing_time: 0.004025,
  backend_status_code: '200',
  'backend:port': '172.00.00.00:80',
  client: '00.00.00.00',
  'client:port': '00.00.00.00:52878',
  elb: 'fxa-conte-ContentS',
  elb_status_code: '200',
  received_bytes: '0',
  request: '"GET https://accounts.stage.mozaws.net:443/settings HTTP/1.1"',
  request_processing_time: 0.000072,
  requested_resource: 'https://accounts.stage.mozaws.net:443/settings',
  'requested_resource.host': 'accounts.stage.mozaws.net:443',
  'requested_resource.hostname': 'accounts.stage.mozaws.net',
  'requested_resource.href': 'https://accounts.stage.mozaws.net:443/settings',
  'requested_resource.path': '/settings',
  'requested_resource.pathname': '/settings',
  'requested_resource.port': '443',
  'requested_resource.protocol': 'https:',
  response_processing_time: 0.000048,
  sent_bytes: '1537',
  ssl_cipher: 'ECDHE-RSA-AES128-GCM-SHA256',
  ssl_protocol: 'TLSv1.2',
  target_group_arn: undefined,
  timestamp: '2017-06-05T23:55:32.954546Z',
  trace_id: undefined,
  total_time: 0.004145,
  type: undefined,
  user_agent:
    '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0 FxATester/1.0"'
};

describe('parseLogline', () => {
  it('parses a valid logline', () => {
    let result = parseLogline(VALID_LOG_LINE);
    cassert.isObject(result);
    result = result as ParsedLine; // TS can't verify the above cassert
    cassert.deepEqual(result, PARSED_VALID_LOG_LINE);
  });
});
