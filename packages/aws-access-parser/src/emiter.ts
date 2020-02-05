/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';

import { ParsedLine } from './parser';

export type EmitterConfig = {
  prefix: string;
  pathTranslations: {
    [statTag: string]: RegExp;
  };
  unknownPathTarget: string;
};

export class LoglineEmitter {
  constructor(private config: EmitterConfig, private statsd: StatsD) {}

  private matchPathToTag(url: string) {
    let stat;
    for (const [statTag, match] of Object.entries(this.config.pathTranslations)) {
      if (match.exec(url)) {
        stat = statTag;
        break;
      }
    }
    return stat || this.config.unknownPathTarget;
  }

  public emitLogline(line: ParsedLine) {
    const timestamp = new Date(line.timestamp).getTime();
    const pathTag = this.matchPathToTag(line['requested_resource.path'] || '');

    // And now I discover this won't actually work... :(
    // this.statsd.timing();
  }
}
