/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { S3Event, Context } from 'aws-lambda';
import S3 from 'aws-sdk/clients/s3';

type LogLine = {
  timestamp: number;
  elb: string;
  client: string;
  backend: string;
  requestProcessingTime: number;
  backendProcessingTime: number;
  responseProcessingTime: number;
  elbStatusCode: number;
  backendStatusCode: number;
  sentBytes: number;
  request: string;
  userAgent: string;
  sslCipher: string;
  sslProtocol: string;
};

/**
 * Retrieve a logfile from S3 and yield the log lines
 *
 * @param client S3 Client
 * @param bucket Bucket name to read from.
 * @param key Key of the object to fetch.
 */
async function retrieveLogfile(client: S3, bucket: string, key: string): AsyncIterator<LogLine> {
  const s3Result = await client.getObject({ Bucket: bucket, Key: key }).promise();
  if (!s3Result.Body) {
    throw Error('No data returned.');
  }
}

export async function handler(event: S3Event, context: Context): Promise<any> {
  return;
}
