import React from 'react';
import Button from '@material-ui/core/Button';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { Typography } from '@material-ui/core';
import { ReactComponent as UploadIcon } from 'assets/images/download.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import Avatar from 'components/Avatar';
import Grid from '@material-ui/core/Grid';

import CustomTooltip from 'components/Core/Tooltip';
import Modal from 'components/Core/Modal';
import TextAreaField from 'components/Core/Formik/TextAreaField';
import PhoneInputField from 'components/Core/Formik/PhoneInputField';
import styles from './index.module.css';
import Switch from '../../../../../../components/Core/Switch';

const EditPractitioner = ({
  id,
  firstName,
  lastName,
  practitionerImg,
  phoneNo,
  readyForDocSms,
  description,
  editInformation,
  handleAvatarChange,
  handleAvatarDelete,
  disableFields,
  onClose,
}) => {
  const initialValues = {
    phoneNo: phoneNo || '',
    readyForDocSms: readyForDocSms || false,
    description,
  };
  const validationSchema = Yup.object({
    phoneNo: Yup.string()
      .trim()
      .nullable()
      .notRequired()
      .test('phoneNo', 'Invalid phone number', (phoneNo) => {
        /**
         * Only validate phone number if the input is given.
         */
        if (phoneNo) {
          const schema = Yup.string().phone('US', false);
          return schema.isValidSync(phoneNo);
        }
        return true;
      }),
    readyForDocSms: Yup.bool(),
    description: Yup.string()
      .trim()
      .nullable()
      .test(
        'description',
        'Description length should be less than 100 characters',
        (description) => {
          /**
           * Only validate description if the input is given.
           */
          if (description) {
            const schema = Yup.string().max(100);
            return schema.isValidSync(description);
          }
          return true;
        },
      ),
  });

  const handleSubmit = (e) => {
    editInformation({
      id,
      phoneNo: e.phoneNo,
      bio: e.description,
      readyForDocSms: e.readyForDocSms,
    });
  };

  return (
    <Modal
      size="sm"
      header={firstName + ' ' + lastName}
      body={
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {({ values, handleChange, isSubmitting, errors, setFieldValue }) => (
            <Form>
              <Grid container xs={12} alignItems="center" className="mb-4">
                <Grid item xs={2}>
                  <Avatar
                    src={practitionerImg}
                    id={id}
                    firstName={firstName}
                    lastName={lastName}
                    width={62}
                    height={62}
                    letterFontSize="1.25rem"
                    className={styles.avatar}
                  />
                </Grid>
                <Grid container item xs={10} direction="column">
                  <Grid item>
                    <input
                      className={styles.hidden}
                      id="avatar_uploader"
                      type="file"
                      onChange={(e) => handleAvatarChange(e, id)}
                      accept=".jpg, .png, .jpeg"
                    />
                    <label htmlFor="avatar_uploader" className={styles.label}>
                      <Button
                        component="span"
                        className={styles.actionContainer}
                        disabled={isSubmitting || disableFields}
                      >
                        <UploadIcon className={styles.avatarButtonIcon} />
                        Upload Photo
                      </Button>
                    </label>
                  </Grid>
                  <Grid item>
                    <Button
                      className={styles.actionContainer}
                      onClick={() => handleAvatarDelete(id)}
                      disabled={
                        isSubmitting ||
                        (practitionerImg !== null &&
                          practitionerImg.length === 0) ||
                        practitionerImg === null ||
                        disableFields
                      }
                    >
                      <DeleteIcon className={styles.avatarButtonIcon} />
                      Delete
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>
                  NAME{' '}
                  <CustomTooltip
                    title="Provider name should be changed in the EHR"
                    color="#000"
                    placement="top-start"
                    arrow
                  >
                    <HelpOutlineIcon
                      style={{ fontSize: '1rem', marginLeft: '0.25rem' }}
                      htmlColor="#9A9A9A"
                    />
                  </CustomTooltip>
                </span>
                <span className={styles.fieldValue}>
                  {firstName + ' ' + lastName}
                </span>
              </div>
              <span className={`mt-3 mb-2 ${styles.fieldLabel}`}>
                PHONE NUMBER{' '}
                <CustomTooltip
                  title="Phone numbers are not displayed publicly. They are used only for relevant SMS triggers"
                  color="#000"
                  placement="top-start"
                  arrow
                  maxWidth={210}
                >
                  <HelpOutlineIcon
                    style={{ fontSize: '1rem', marginLeft: '0.25rem' }}
                    htmlColor="#9A9A9A"
                  />
                </CustomTooltip>
              </span>
              <PhoneInputField
                mt={3}
                fieldName="phoneNo"
                disabled={isSubmitting}
                showMaskedPlaceholder={false}
                callbackOnUpdate={(e) => {
                  if (e.target.value === '')
                    setFieldValue('readyForDocSms', false, true);
                }}
              />
              <div className="d-flex mt-2 align-items-center">
                <Switch
                  className="mr-2"
                  checked={values.readyForDocSms}
                  onChange={handleChange}
                  disabled={!values.phoneNo || errors.phoneNo}
                  fieldName="readyForDocSms"
                  name="readyForDocSms"
                />
                <Typography>Send “Ready for Doc” SMS</Typography>
              </div>
              <TextAreaField
                mt={2}
                fieldLabel="DESCRIPTION"
                fieldName="description"
                disabled={isSubmitting}
                shouldResize={false}
              />
              <div className={styles.footer}>
                <Button
                  className="primary-btn me-auto"
                  variant="outlined"
                  disabled={isSubmitting}
                  color="primary"
                  onClick={onClose}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="secondary-btn"
                  variant="contained"
                  disabled={isSubmitting}
                  color="secondary"
                >
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      }
      onClose={onClose}
    />
  );
};

export default EditPractitioner;
