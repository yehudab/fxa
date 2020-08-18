/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import PasswordInput from '../PasswordInput';

export const ConfirmPasswordStep = (_: RouteComponentProps) => {
  const navigate = useNavigate();
  return (
    <form className="">
      <PasswordInput label="Enter Password" />
      <div className="flex mt-6">
        <button
          className="cta-neutral-lg transition-standard flex-1"
          data-testid="modal-cancel"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          className="cta-primary transition-standard flex-1"
          data-testid="modal-confirm"
          onClick={() => navigate('../recovery_key')}
        >
          Confirm
        </button>
      </div>
    </form>
  );
};

export default ConfirmPasswordStep;
