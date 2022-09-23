import React, { useCallback, useRef, useState } from 'react';
import { IconButton } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import { ReactComponent as PencilIcon } from 'assets/images/pencil.svg';
import { ReactComponent as GreenCheck } from 'assets/images/green-check.svg';
import { ReactComponent as GreyCross } from 'assets/images/grey-cross.svg';
import { Form, Formik } from 'formik';
import TextInputField from '../Formik/TextInputField';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import { useStores } from 'hooks/useStores';
import classnames from './index.module.css';
import * as Yup from 'yup';

const Editable = ({
  setisEdit = () => {
    return;
  },
  isBlock = false,
  fieldName = 'field',
  loading,
  text,
  onUpdate,
  yupValidation = { error: '', isValid: null },
  allowSpecialChars = true,
}) => {
  const [inFocus, setInFocus] = useState(false);
  const formRef = useRef(null);
  const { notification } = useStores();

  const isUpdating = Boolean(loading);

  const styles = {
    icon: { color: '#9A9A9A' },
    actionButton: {
      padding: 4,
    },
  };

  const onClickOutsideHandler = useCallback(() => {
    if (!isUpdating) {
      setInFocus(false);
      setisEdit(false);
    }
  }, [isUpdating]);

  useOnClickOutside(formRef, onClickOutsideHandler);

  const generalValidation = allowSpecialChars
    ? Yup.string()
        .max(35, 'More than 35 characters are not allowed!')
        .required(`The ${fieldName} can not be empty!`)
    : Yup.string()
        .max(35, 'More than 35 characters are not allowed!')
        .required(`The ${fieldName} can not be empty!`)
        .test(
          'special-chars',
          'Special characters are not allowed!',
          (text) => {
            const specialChars = /[!@#$%^&*(),.?":{}|<>]/g;
            const hasSpecialChars = specialChars.test(text);
            if (hasSpecialChars) {
              return false;
            }
            return true;
          },
        );

  const customValidation = generalValidation.test(
    'custom',
    yupValidation.error,
    (val) => {
      if (!yupValidation.isValid) return true;
      return yupValidation.isValid(val);
    },
  );

  const validationSchema = Yup.object({
    [fieldName]: yupValidation.isValid ? customValidation : generalValidation,
  });

  return (
    <div style={{ maxWidth: 250 }}>
      {inFocus ? (
        <Formik
          initialValues={{ [fieldName]: text }}
          validationSchema={validationSchema}
          validateOnChange
          onSubmit={(val) => {
            onUpdate(val[fieldName])
              .then(() => {
                setInFocus(false);
                setisEdit(false);
              })
              .catch((error) => notification.showError(error.message));
          }}
        >
          {({ values, isSubmitting }) => (
            <Form
              ref={formRef}
              className={`d-flex align-items-center   ${
                isBlock && classnames.isBlock
              }`}
            >
              <TextInputField
                className={isBlock && classnames.inboundCallForm}
                disabled={isUpdating || isSubmitting}
                inputProps={{ style: { height: 10 }, maxLength: 35 }}
                autoFocus
                fieldName={fieldName}
                variant="outlined"
              />
              <IconButton
                className="ml-2"
                style={styles.actionButton}
                disabled={isUpdating || isSubmitting}
                type="submit"
              >
                {isBlock ? <GreenCheck /> : <CheckIcon style={styles.icon} />}
              </IconButton>
              <IconButton
                disabled={isUpdating || isSubmitting}
                style={styles.actionButton}
                type="reset"
                onClick={() => {
                  setInFocus(false);
                  setisEdit(false);
                }}
              >
                {isBlock ? <GreyCross /> : <ClearIcon style={styles.icon} />}
              </IconButton>
            </Form>
          )}
        </Formik>
      ) : (
        <span className="d-flex align-items-center">
          {text}
          <IconButton
            onClick={() => {
              setInFocus(true);
              setisEdit(true);
            }}
          >
            <PencilIcon />
          </IconButton>
        </span>
      )}
    </div>
  );
};

export default React.memo(Editable);
