/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* ParsedLine and parseLogline MIT licensed from:
   https://github.com/ozantunca/elb-log-analyzer/blob/master/src/lib.ts

* The MIT License (MIT)

Copyright (c) 2015, 2016, Ozan Tunca

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { parse, UrlWithStringQuery } from 'url';
import _ from 'lodash';

export interface ParsedLine {
  timestamp: string;
  elb: string;
  client: string;
  'client:port': string;
  backend: string;
  'backend:port': string;
  request_processing_time: number;
  backend_processing_time: number;
  response_processing_time: number;
  elb_status_code: string;
  backend_status_code: string;
  received_bytes: string;
  sent_bytes: string;
  request: string;
  requested_resource: string;
  'requested_resource.pathname'?: string;
  'requested_resource.host'?: string;
  'requested_resource.protocol'?: string;
  'requested_resource.port'?: string;
  'requested_resource.hostname'?: string;
  'requested_resource.path'?: string;
  'requested_resource.origin'?: string;
  'requested_resource.search'?: string;
  'requested_resource.href'?: string;
  'requested_resource.hash'?: string;
  'requested_resource.searchParams'?: string;
  'requested_resource.username'?: string;
  'requested_resource.password'?: string;
  user_agent: string;
  total_time: number;
  ssl_cipher: string;
  ssl_protocol: string;
  target_group_arn?: string;
  trace_id?: string;
  type?: string;
  [key: string]: number | string | undefined;
}

const logLineRegex = /[^\s"']+|"([^"]*)"/gi;

export function* parseLogfile(logFile: string): Generator<ParsedLine> {
  for (const rawLine in logFile.split(/\r?\n/)) {
    if (rawLine.length === 0) {
      continue;
    }
    const line = parseLogline(rawLine);
    if (line) {
      yield line;
    }
  }
}

export function parseLogline(line: string): ParsedLine | undefined {
  const ATTRIBUTES = line.match(logLineRegex);
  if (!ATTRIBUTES || ATTRIBUTES.length < 14) {
    // Must have at least 13 match as the user-agent can be last if there
    // was no SSL.
    return;
  }

  let type: string | undefined;

  if (isNaN(new Date(ATTRIBUTES[0]).getTime())) {
    type = ATTRIBUTES.shift();
  }

  const requestedResource = String(ATTRIBUTES[11]).split(' ')[1];
  const urlKeys: (keyof UrlWithStringQuery)[] = [
    'pathname',
    'host',
    'protocol',
    'port',
    'hostname',
    'path',
    'search',
    'href',
    'hash'
  ];

  // Filter null's/undefined
  const parsedURL = _.pickBy(
    parse(requestedResource),
    (value, key) => urlKeys.includes(key as keyof UrlWithStringQuery) && !!value
  );

  const parsedLine: ParsedLine = {
    timestamp: ATTRIBUTES[0],
    elb: ATTRIBUTES[1],
    client: String(ATTRIBUTES[2]).split(':')[0],
    'client:port': ATTRIBUTES[2],
    backend: String(ATTRIBUTES[3]).split(':')[0],
    'backend:port': ATTRIBUTES[3],
    request_processing_time: Number(ATTRIBUTES[4]),
    backend_processing_time: Number(ATTRIBUTES[5]),
    response_processing_time: Number(ATTRIBUTES[6]),
    elb_status_code: ATTRIBUTES[7],
    backend_status_code: ATTRIBUTES[8],
    received_bytes: ATTRIBUTES[9],
    sent_bytes: ATTRIBUTES[10],
    request: ATTRIBUTES[11],
    requested_resource: requestedResource,
    ..._.reduce(
      parsedURL,
      (merged, current, key) => ({
        ...merged,
        [`requested_resource.${key}`]: current
      }),
      {}
    ),
    user_agent: ATTRIBUTES[12],
    total_time: Number(ATTRIBUTES[4]) + Number(ATTRIBUTES[5]) + Number(ATTRIBUTES[6]),
    ssl_cipher: ATTRIBUTES[13],
    ssl_protocol: ATTRIBUTES[14],
    target_group_arn: ATTRIBUTES[15],
    trace_id: ATTRIBUTES[16],
    type
  };

  return parsedLine;
}
