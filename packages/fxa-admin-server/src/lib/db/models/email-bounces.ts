/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Model } from 'objection';

export enum BounceType {
  unmapped,
  Permanent,
  Transient,
  Complaint
}

export enum BounceSubType {
  unmapped,
  Undetermined,
  General,
  NoEmail,
  Suppressed,
  MailboxFull,
  MessageTooLarge,
  ContentRejected,
  AttachmentRejected,
  Abuse,
  AuthFailure,
  Fraud,
  NotSpam,
  Other,
  Virus
}

export class EmailBounces extends Model {
  public static tableName = 'emailBounces';

  public readonly email!: string;
  public createdAt!: number;
  public bounceType!: number;
  public bounceSubType!: number;
}
