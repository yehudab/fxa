/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ObjectType, registerEnumType } from 'type-graphql';

import { BounceSubType, BounceType } from '../../db/models/email-bounces';

registerEnumType(BounceType, {
  name: 'BounceType'
});
registerEnumType(BounceSubType, {
  name: 'BounceSubType'
});

@ObjectType()
export class EmailBounce {
  @Field()
  public email!: string;

  @Field(type => BounceType)
  public bounceType!: string;

  @Field(type => BounceSubType)
  public bounceSubType!: string;

  @Field()
  public createdAt!: number;
}
