/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { copy } from '../../lib/clipboard';
import ButtonIcon from '../ButtonIcon';
import { ReactComponent as CopyIcon } from './copy.svg';
import { ReactComponent as DownloadIcon } from './download.svg';
import { ReactComponent as PrintIcon } from './print.svg';

export type GetDataTrioProps = {
  value: string | string[];
  url: string;
};

export const GetDataTrio = ({ value, url }: GetDataTrioProps) => {
  return (
    <div className="flex justify-between max-w-48">
      {/**
       * TODO: Implement mechanism to
       * download the data supplied
       **/}
      <ButtonIcon
        size="medium"
        title="Download"
        testId="databutton-download"
        classNames="text-grey-500 active:text-blue-500"
        icon={[DownloadIcon, 18, 24]}
      />

      <ButtonIcon
        size="medium"
        title="Copy"
        testId="databutton-copy"
        classNames="text-grey-500 active:text-blue-500"
        icon={[CopyIcon, 21, 24]}
        onClick={async () => {
          const copyValue = Array.isArray(value) ? value.join(', ') : value;
          await copy(copyValue);
        }}
      />

      {/**
       * TODO: Open separate page with data
       * and trigger print dialogue
       **/}
      <ButtonIcon
        size="medium"
        title="Print"
        testId="databutton-print"
        classNames="text-grey-500 active:text-blue-500"
        icon={[PrintIcon, 24, 24]}
      />
    </div>
  );
};

export default GetDataTrio;
