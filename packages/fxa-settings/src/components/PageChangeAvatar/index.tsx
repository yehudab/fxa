/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import FlowContainer from '../FlowContainer';
import ButtonIcon from '../ButtonIcon';
import Avatar from '../Avatar';
import AvatarCropper from '../AvatarCropper';
import { ReactComponent as AddIcon } from './add.svg';
import { ReactComponent as CameraIcon } from './camera.svg';
import { ReactComponent as RemoveIcon } from './remove.svg';

export const PageChangeAvatar = ({}: RouteComponentProps) => {
  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    // TODO: actually perform the change password
  };

  return (
    <FlowContainer title="Profile Picture">
      <form onSubmit={handleSubmit}>
        <Avatar className="mx-auto w-32" />

        <AvatarCropper />

        <div className="flex justify-center max-w-xs mx-auto my-4">
          <ButtonIcon
            size="medium"
            title="Add photo"
            icon={[AddIcon, 22, 22]}
            classNames="mx-2 text-grey-500 hover:text-grey-600 hover:text-grey-600 focus:text-grey-400"
          />
          <ButtonIcon
            size="medium"
            title="Take photo"
            icon={[CameraIcon, 24, 22]}
            classNames="mx-2 text-grey-500 hover:text-grey-600 hover:text-grey-600 focus:text-grey-400"
          />
          <ButtonIcon
            size="medium"
            title="Remove photo"
            icon={[RemoveIcon, 22, 22]}
            classNames="mx-2 text-grey-500 hover:text-grey-600 hover:text-grey-600 focus:text-grey-400"
          />
          <ButtonIcon
            size="medium"
            title="Take photo"
            icon={[CameraIcon, 22, 22]}
            classNames="mx-2 bg-red-500 text-white rounded-full border border-red-600 hover:bg-red-600 hover:border-red-600 active:border-red-700 focus:border-red-800"
          />
        </div>

        <div className="flex justify-center mx-auto max-w-64">
          <button
            className="cta-neutral mx-2 flex-1"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button className="cta-primary mx-2 flex-1" disabled={true}>
            Save
          </button>
        </div>
      </form>
    </FlowContainer>
  );
};

export default PageChangeAvatar;
