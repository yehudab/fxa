/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { UnitRow } from '../UnitRow';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import Modal from '../Modal';

export const DELETE_RECOVERY_KEY_MUTATION = gql`
  mutation deleteRecoveryKey($input: DeleteRecoveryKeyInput!) {
    deleteRecoveryKey(input: $input) {
      clientMutationId
    }
  }
`;

type SecurityProps = {
  twoFactorAuthEnabled: boolean;
  accountRecoveryKeyEnabled: boolean;
  className?: string;
};

export const Security = ({
  twoFactorAuthEnabled,
  accountRecoveryKeyEnabled,
}: SecurityProps) => {
  const getValue = (settingOption: boolean) =>
    settingOption ? 'Enabled' : 'Not Set';
  const getClassName = (settingOption: boolean) =>
    settingOption ? 'text-green-800' : '';
  const [
    recoveryModalRevealed,
    revealRecoveryModal,
    hideRecoveryModal,
  ] = useBooleanState();
  const recoveryRoute = accountRecoveryKeyEnabled
    ? undefined
    : '/beta/settings/account_recovery/confirm_password';
  const [deleteRecoveryKey, { data, error }] = useMutation(
    DELETE_RECOVERY_KEY_MUTATION,
    {
      variables: { input: {} },
      onCompleted: hideRecoveryModal,
      refetchQueries: ['GetInitialState'],
      update: (cache, result) => {
        // TODO: update the enabled state instead of refreshing the query
      },
    }
  );

  return (
    <section className="mt-11" id="security" data-testid="settings-security">
      <h2 className="font-header font-bold ml-4 mb-4">Security</h2>
      <div className="bg-white tablet:rounded-xl shadow">
        <UnitRow
          header="Recovery key"
          headerValueClassName={getClassName(accountRecoveryKeyEnabled)}
          headerValue={getValue(accountRecoveryKeyEnabled)}
          route={recoveryRoute}
          revealModal={
            accountRecoveryKeyEnabled ? revealRecoveryModal : undefined
          }
          modalRevealed={
            accountRecoveryKeyEnabled ? recoveryModalRevealed : undefined
          }
          ctaText={accountRecoveryKeyEnabled ? 'Remove' : 'Create'}
        >
          <p className="text-sm mt-3">
            Restores your information when you forget your password.
          </p>
          <LinkExternal
            className="link-blue text-xs mt-2"
            href="https://support.mozilla.org/en-US/kb/reset-your-firefox-account-password-recovery-keys"
          >
            Why does resetting my password reset my data?
          </LinkExternal>
          {recoveryModalRevealed && (
            <Modal
              onDismiss={hideRecoveryModal}
              onConfirm={deleteRecoveryKey}
              headerId="some-id"
              descId="some-desc"
            >
              <h2 id="some-id" className="font-bold text-xl text-center mb-2">
                Remove recovery key?
              </h2>
              <p id="some-desc">
                In the event you reset your password, you won't be able to use
                your recovery key to access your data. You can't undo this
                action.
              </p>
            </Modal>
          )}
        </UnitRow>

        <hr className="unit-row-hr" />

        <UnitRow
          header="Two-step authentication"
          headerValueClassName={getClassName(twoFactorAuthEnabled)}
          headerValue={getValue(twoFactorAuthEnabled)}
          route="/beta/settings/two_step_authentication"
        >
          <p className="text-sm mt-3">
            Prevent someone else from logging in by requiring a unique code only
            you have access to.
          </p>
        </UnitRow>
      </div>
    </section>
  );
};

export default Security;
