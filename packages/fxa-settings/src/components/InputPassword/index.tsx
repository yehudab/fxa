/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useCallback, ChangeEvent } from 'react';
import InputText, { InputTextProps } from '../InputText';
import { ReactComponent as OpenEye } from './eye-open.svg';
import { ReactComponent as ClosedEye } from './eye-closed.svg';

type InputPasswordProps = Omit<InputTextProps, 'type'>;

export const InputPassword = ({
  defaultValue,
  disabled,
  label,
  placeholder,
  className,
  onChange,
  inputRef,
  errorText,
  name,
}: InputPasswordProps) => {
  const [hasContent, setHasContent] = useState<boolean>(defaultValue != null);
  const [visible, setVisible] = useState<boolean>(false);

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setHasContent(event.target.value.length > 0);
      onChange && onChange(event);
    },
    [onChange]
  );

  return (
    <InputText
      type={visible ? `text` : 'password'}
      {...{
        defaultValue,
        disabled,
        label,
        placeholder,
        onChange: onInputChange,
        className,
        inputRef,
        errorText,
        name,
      }}
    >
      <button
        type="button"
        data-testid="visibility-toggle"
        className={`w-5 px-3 py-2 text-grey-600 focus:text-blue-500 box-content ${
          hasContent ? '-ml-3' : 'hidden'
        }`}
        tabIndex={-1}
        onClick={() => {
          setVisible(!visible);
        }}
        title={visible ? 'Hide password' : 'Show password'}
        aria-label={
          visible
            ? 'Hide password from screen.'
            : 'Show password as plain text. Your password will be visible on screen.'
        }
      >
        {visible ? (
          <ClosedEye
            width="24"
            height="24"
            className="stroke-current"
            aria-hidden="true"
          />
        ) : (
          <OpenEye
            width="24"
            height="18"
            className="stroke-current"
            aria-hidden="true"
          />
        )}
      </button>
    </InputText>
  );
};

export default InputPassword;
