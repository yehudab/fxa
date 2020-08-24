/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { gql } from '@apollo/client';
import {
  useFocusOnTriggeringElementOnClose,
  useHandledMutation,
} from '../../lib/hooks';
import UnitRow from '../UnitRow';
import Modal from '../Modal';
import AlertBar from '../AlertBar';
import ModalVerifySession from '../ModalVerifySession';
import { useAccount, useSession, Email, Account } from '../../models';
import { ReactComponent as TrashIcon } from './trash-icon.svg';

export const RESEND_EMAIL_CODE_MUTATION = gql`
  mutation resendSecondaryEmailCode($input: EmailInput!) {
    resendSecondaryEmailCode(input: $input) {
      clientMutationId
    }
  }
`;

export const MAKE_EMAIL_PRIMARY_MUTATION = gql`
  mutation updatePrimaryEmail($input: EmailInput!) {
    updatePrimaryEmail(input: $input) {
      clientMutationId
    }
  }
`;

export const DELETE_EMAIL_MUTATION = gql`
  mutation deleteSecondaryEmail($input: EmailInput!) {
    deleteSecondaryEmail(input: $input) {
      clientMutationId
    }
  }
`;

type UnitRowSecondaryEmailContentAndActionsProps = {
  secondaryEmailObj: Email;
  isLastVerifiedSecondaryEmail: boolean;
};

export const UnitRowSecondaryEmail = () => {
  const account = useAccount();
  const session = useSession();
  const primaryEmail = account.primaryEmail.email;
  const primaryEmailIsVerified = account.primaryEmail.verified;
  const secondaryEmails = account.emails.filter((email) => !email.isPrimary);
  const hasAtLeastOneSecondaryEmail = !!secondaryEmails.length;
  const lastVerifiedSecondaryEmailIndex = secondaryEmails
    .map((email) => email.verified)
    .lastIndexOf(true);

  const [alertBarRevealed, revealAlertBar, hideAlertBar] = useBooleanState();
  const [queuedAction, setQueuedAction] = useState<(() => void) | null>(null);
  const [actionableEmail, setActionableEmail] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<
    [string, 'success' | 'error' | 'info'] | null
  >(null);

  const showSuccess = useCallback(
    (message: string) => {
      setAlertMessage([message, 'success']);
      revealAlertBar();
    },
    [setAlertMessage, revealAlertBar]
  );

  const showError = useCallback(
    (message: string) => {
      setAlertMessage([message, 'error']);
      revealAlertBar();
    },
    [setAlertMessage, revealAlertBar]
  );

  const [resendEmailCode] = useHandledMutation(RESEND_EMAIL_CODE_MUTATION, {
    onCompleted() {
      showSuccess(
        `Check the inbox for ${actionableEmail} to verify your secondary email.`
      );
    },
    onError(error) {
      showError(`Sorry, there was a problem re-sending the verification code.`);
      throw error;
    },
  });

  const [makeEmailPrimary] = useHandledMutation(MAKE_EMAIL_PRIMARY_MUTATION, {
    onCompleted() {
      showSuccess(`${actionableEmail} is now your primary email.`);
    },
    onError(error) {
      showError(`Sorry, there was a problem changing your primary email.`);
      throw error;
    },
    update: (cache) => {
      cache.modify({
        fields: {
          account: (existing: Account) => {
            const emails = existing.emails.map((m) => {
              if (m.email === actionableEmail) {
                return { ...m, isPrimary: true };
              }

              if (m.isPrimary && m.email !== actionableEmail) {
                return { ...m, isPrimary: false };
              }

              return { ...m };
            });

            return { ...existing, emails };
          },
        },
      });
    },
  });

  const [deleteEmail] = useHandledMutation(DELETE_EMAIL_MUTATION, {
    onCompleted() {
      showSuccess(`${actionableEmail} email successfully deleted.`);
    },
    onError(error) {
      showError(`Sorry, there was a problem deleting this email.`);
      throw error;
    },
    update: (cache) => {
      cache.modify({
        fields: {
          account: (existing: Account) => {
            const emails = existing.emails
              .map((m) => {
                if (m.email === actionableEmail) {
                  return null;
                }

                return { ...m };
              })
              .filter((m) => !!m);

            return { ...existing, emails };
          },
        },
      });
    },
  });

  useEffect(() => {
    if (queuedAction && session.verified) {
      queuedAction();
    }
  }, [queuedAction, session]);

  const UnitRowSecondaryEmailNotSet = () => {
    const [modalRevealed, revealModal, hideModal] = useBooleanState();
    const modalHeaderId = 'modal-header-verify-email';
    const modalDescId = 'modal-desc-verify-email';

    const resendPrimaryEmailCodeFromModal = useCallback(() => {
      // Resend primary email verification code - part of FXA-1613
      hideModal();
      revealAlertBar();
    }, [hideModal]);

    const modalTriggerElement = useRef<HTMLButtonElement>(null);
    // If the UnitRow children contains an AlertBar that is revealed,
    // don't redirect focus back to the element that opened the modal
    // because focus will be set in the AlertBar.
    useFocusOnTriggeringElementOnClose(
      modalRevealed,
      modalTriggerElement,
      alertBarRevealed
    );
    const route = primaryEmailIsVerified
      ? '/beta/settings/secondary_email'
      : undefined;
    const revealModalIfPrimaryEmailIsNotVerified = primaryEmailIsVerified
      ? undefined
      : revealModal;

    // user doesn't have a secondary email (verified or unverified) set
    return (
      <UnitRow
        header="Secondary email"
        headerValue={null}
        revealModal={revealModalIfPrimaryEmailIsNotVerified}
        {...{
          route,
          modalRevealed,
          alertBarRevealed,
        }}
      >
        <SecondaryEmailDefaultContent />

        {modalRevealed && (
          <Modal
            onDismiss={hideModal}
            onConfirm={resendPrimaryEmailCodeFromModal}
            headerId={modalHeaderId}
            descId={modalDescId}
          >
            <h2
              id={modalHeaderId}
              className="font-bold text-xl text-center mb-2"
              data-testid={modalHeaderId}
            >
              Verify primary email first
            </h2>
            <p
              className="text-center"
              id={modalDescId}
              data-testid={modalDescId}
            >
              Before you can add a secondary email, you must verify your primary
              email. To do this, you'll need access to {primaryEmail}
            </p>
          </Modal>
        )}
      </UnitRow>
    );
  };

  const UnitRowSecondaryEmailContentAndActions = ({
    secondaryEmailObj,
    isLastVerifiedSecondaryEmail,
  }: UnitRowSecondaryEmailContentAndActionsProps) => {
    const secondaryEmail = secondaryEmailObj.email;
    const secondaryEmailIsVerified = secondaryEmailObj.verified;

    const queueEmailAction = (action: (...args: any[]) => void) => {
      setActionableEmail(secondaryEmail);
      setQueuedAction(() => {
        return () => {
          setQueuedAction(null);
          action.call(null, {
            variables: { input: { email: secondaryEmail } },
          });
        };
      });
    };

    return (
      <>
        {queuedAction && !session.verified && (
          <ModalVerifySession
            onDismiss={() => {
              showError(
                `Sorry, you'll need to verify your current session to perform this action.`
              );
            }}
            onError={(error) => {
              showError(error.message);
            }}
            onCompleted={queuedAction}
          />
        )}
        {alertBarRevealed && alertMessage && (
          <AlertBar onDismiss={hideAlertBar} type={alertMessage[1]}>
            <p data-testid={`alert-bar-message-${alertMessage[1]}`}>
              {alertMessage[0]}
            </p>
          </AlertBar>
        )}
        <div className="mobileLandscape:flex unit-row-multi-row">
          <div className="unit-row-content" data-testid="unit-row-content">
            <p className="font-bold" data-testid="unit-row-header-value">
              <span className="flex justify-between items-center">
                {secondaryEmail}
                <DeleteEmailButton
                  classNames="mobileLandscape:hidden"
                  onClick={() => {
                    queueEmailAction(deleteEmail);
                  }}
                />
              </span>
              {!secondaryEmailIsVerified && (
                <span
                  data-testid="unverified-text"
                  className="uppercase block text-orange-600 font-bold text-xs"
                >
                  unverified
                </span>
              )}
            </p>
            {secondaryEmailIsVerified && isLastVerifiedSecondaryEmail && (
              <SecondaryEmailDefaultContent />
            )}
            {!secondaryEmailIsVerified && (
              <p className="text-xs mt-3 text-grey-400">
                Verification needed.
                <button
                  className="link-blue mx-1"
                  data-testid="resend-secondary-email-code-button"
                  onClick={() => {
                    queueEmailAction(resendEmailCode);
                  }}
                >
                  Resend verification email
                </button>
                if it's not in your email or spam.
              </p>
            )}
          </div>
          <div className="unit-row-actions" data-testid="unit-row-actions">
            <div className="flex items-center -mt-1">
              {secondaryEmailIsVerified && (
                <button
                  className="cta-neutral cta-base transition-standard"
                  onClick={() => {
                    queueEmailAction(makeEmailPrimary);
                  }}
                  data-testid="secondary-email-make-primary"
                >
                  Make primary
                </button>
              )}
              <DeleteEmailButton
                classNames="hidden mobileLandscape:inline-block"
                testId="secondary-email-delete"
                onClick={() => {
                  queueEmailAction(deleteEmail);
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  if (!hasAtLeastOneSecondaryEmail) {
    return <UnitRowSecondaryEmailNotSet />;
  }

  // user has at least one secondary email (verified or unverified) set
  return (
    <div className="unit-row">
      <div className="unit-row-header">
        <h3 data-testid="unit-row-header">Secondary email</h3>
      </div>
      <div className="mobileLandscape:flex-3 desktop:flex-5">
        {secondaryEmails.map((secondaryEmailObj, index) => (
          <UnitRowSecondaryEmailContentAndActions
            key={secondaryEmailObj.email}
            isLastVerifiedSecondaryEmail={
              index === lastVerifiedSecondaryEmailIndex
            }
            {...{
              secondaryEmailObj,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SecondaryEmailDefaultContent = () => (
  <div data-testid="secondary-email-default-content">
    <p className="text-sm mt-3">
      Access your account if you can't log in to your primary email.
    </p>
    <p className="text-grey-400 text-xs mt-2">
      Note: a secondary email won't restore your information—you'll need a{' '}
      <a
        className="link-blue"
        href="#recovery-key"
        data-testid="link-recovery-key"
      >
        recovery key
      </a>{' '}
      for that.
    </p>
  </div>
);

const DeleteEmailButton = ({
  classNames,
  onClick,
  testId,
}: {
  classNames: string;
  onClick: () => void;
  testId?: string;
}) => (
  <button
    className={`relative w-8 h-8 ml-2 text-red-500 active:text-red-800 focus:text-red-800 ${classNames}`}
    title="Remove email"
    data-testid={testId}
    {...{ onClick }}
  >
    <TrashIcon
      width="11"
      height="14"
      className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
    />
  </button>
);

export default UnitRowSecondaryEmail;
