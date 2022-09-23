import React from 'react';
import styles from './index.module.css';
import { Button } from '@material-ui/core';
import TextAreaField from '../../Core/Formik/TextAreaField';
import { ReactComponent as GreenCheck } from 'assets/images/green-check.svg';
import OfficeSchedulePreview from '../OfficeSchedulePreview';
import Switch from 'components/Core/Switch';

const TextMessageForm = ({
  values,
  handleChange,
  disabled,
  changed,
  textInputHidden,
}) => {
  return (
    <div className={styles.formContainer}>
      {!textInputHidden && (
        <>
          <TextAreaField
            disabled={disabled}
            inputClassName={styles.textArea}
            mt={2}
            rows={3}
            maxLength={320}
            showCharCount
            fieldLabel="MESSAGE"
            fieldName="message"
            shouldResize={true}
          />
          {/* <hr /> */}
          <div className="d-flex align-items-center justify-content-between mt-4">
            <span className={styles.labelText}>
              Send the SMS even if the office is closed
            </span>
            <div
              style={{
                display: 'flex',
                gap: '1em',
                alignItems: 'center',
              }}
            >
              <OfficeSchedulePreview />
              <Switch
                disabled={disabled}
                name="smsEnabledWhenOfficeClosed"
                checked={values.smsEnabledWhenOfficeClosed}
                onChange={handleChange}
              />
            </div>
          </div>
          {/* <hr /> */}
        </>
      )}
      <div className={styles.buttonContainer}>
        {changed && (
          <div className="d-flex justify-content-center align-items-center">
            <GreenCheck />
            Updated
          </div>
          // <Button
          //   disabled={disabled}
          //   type="reset"
          //   variant="outlined"
          //   color="secondary"
          // >
          //   Cancel
          // </Button>
        )}
        <Button
          disabled={!changed || disabled}
          type="submit"
          variant="outlined"
          color="secondary"
        >
          Update
        </Button>
      </div>
    </div>
  );
};

export default TextMessageForm;
