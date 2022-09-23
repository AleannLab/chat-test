import React from 'react';
import { Button } from '@material-ui/core';
import { ReactComponent as DownloadIcon } from 'assets/images/download.svg';
import { ReactComponent as RefreshIcon } from 'assets/images/refresh.svg';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import TextAreaField from 'components/Core/Formik/TextAreaField';
import styles from './index.module.css';

const initialValues = {
  message: '',
};

const validationSchema = Yup.object({
  message: Yup.string()
    .trim()
    .when('enabled', {
      is: false,
      then: Yup.string().notRequired(),
      otherwise: Yup.string()
        .max(320, 'Maximum 320 characters are allowed')
        .required('Message is required!'),
    }),
});
const TextToSpeech = () => {
  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      enableReinitialize
    >
      {({ isSubmitting }) => {
        const isDisabled = isSubmitting;
        return (
          <Form>
            <TextAreaField
              disabled={isDisabled}
              inputClassName={styles.textArea}
              mt={2}
              rows={3}
              shouldValidate={false}
              maxLength={5000}
              fieldLabel="MESSAGE"
              fieldName="message"
              shouldResize={true}
            />
            <div className="mt-2">
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                className={styles.actionIcons}
                size="small"
                startIcon={<PlayCircleFilledIcon />}
              >
                <span className={styles.label}>Play</span>
              </Button>
              <DownloadIcon className={styles.action} />
              <RefreshIcon className={styles.action} />
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default TextToSpeech;
