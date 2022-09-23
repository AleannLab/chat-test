import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Button from '@material-ui/core/Button';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import 'yup-phone';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import moment from 'moment-timezone';
import MenuItem from '@material-ui/core/MenuItem';
import Skeleton from '@material-ui/lab/Skeleton';
import { observer } from 'mobx-react';
import { useStores } from 'hooks/useStores';
import TextInputField from 'components/Core/Formik/TextInputField';
import SelectField from 'components/Core/Formik/SelectField';
import { ReactComponent as EditIcon } from 'assets/images/custom-pencil.svg';
import PhoneInputField from 'components/Core/Formik/PhoneInputField';
import CustomTooltip from 'components/Core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

const OfficeData = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [timezones, setTimezones] = useState([]);
  const { notification, officeProfile } = useStores();

  useEffect(() => {
    const sortByOffset = (a, b) => {
      return (
        moment.tz.zone(b).utcOffset(moment()) -
        moment.tz.zone(a).utcOffset(moment())
      );
    };
    setTimezones(moment.tz.names().sort(sortByOffset));
  }, []);

  let initialValues = {};
  if (officeProfile.loaded) {
    if (Object.keys(officeProfile.data).length === 0) {
      initialValues = {
        office_name: '-',
        office_address: '-',
        office_timezone: 'America/Chicago',
        office_phone_number: '',
        office_reply_to_email: '',
      };
    } else {
      initialValues = {
        office_name: officeProfile.data.office_name,
        office_address: officeProfile.data.office_address,
        office_timezone: officeProfile.data.office_timezone,
        office_phone_number: officeProfile.data.office_phone_number,
        office_reply_to_email: officeProfile.data.office_reply_to_email,
      };
    }
  } else {
    initialValues = {
      office_name: '',
      office_address: '',
      office_timezone: '',
      office_phone_number: '',
      office_reply_to_email: '',
    };
  }

  let validationSchema = Yup.object({
    office_name: Yup.string().nullable().trim().required('Required'),
    office_address: Yup.string().nullable().trim().required('Required'),
    office_timezone: Yup.string().nullable().required('Required'),
    office_phone_number: Yup.string()
      .trim()
      .nullable()
      .required('Required')
      .phone('US', false, 'Invalid phone number'),
    office_reply_to_email: Yup.string()
      .trim()
      .email('Invalid email format')
      .required('Required'),
  });

  const handleSubmitForm = ({ officeProfile, notification }) =>
    async function (val) {
      try {
        const {
          office_name,
          office_address,
          office_timezone,
          office_phone_number,
          office_reply_to_email,
        } = val;
        await officeProfile.updateOfficeProfile({
          office_name,
          office_address,
          office_timezone,
          office_phone_number,
          office_reply_to_email,
        });
      } catch (e) {
        notification.showError(e.message);
      } finally {
        await officeProfile.fetchData();

        /**
         * Refresh page to propagate timezone changes throughout the app
         *
         * KAS-1766: Disable timezone changes from the office dashboard settings.
         * Since we are not allowing the user to update the timezone, we don't need to reload the page.
         * Uncomment the below line of code in case we decide to give user the ability to update timezone.
         */
        // window.location.reload()

        setIsEditing(false);
      }
    };

  return (
    <div>
      {isEditing ? (
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmitForm({ officeProfile, notification })}
          validationSchema={validationSchema}
        >
          {({ isSubmitting }) => (
            <Form>
              {isSubmitting && (
                <div className={styles.successMessage}>
                  <CircularProgress
                    style={{ color: '#566F9F', marginRight: '1rem' }}
                    size={14}
                  />
                  <span>Updating, please wait...</span>
                </div>
              )}

              <div className="mb-3">
                <TextInputField
                  mt={0}
                  fieldLabel="OFFICE NAME"
                  fieldName="office_name"
                  type="text"
                  placeholder="Enter office name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-3">
                <TextInputField
                  mt={0}
                  fieldLabel="OFFICE ADDRESS"
                  fieldName="office_address"
                  type="text"
                  placeholder="Enter office address"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-3">
                <SelectField
                  mt={0}
                  fieldLabel="TIMEZONE"
                  fieldName="office_timezone"
                  options={timezones.map((name, index) => (
                    <MenuItem value={name} key={index}>
                      (GMT{moment.utc().tz(name).format('Z')}) - {name}
                    </MenuItem>
                  ))}
                  disabled // KAS-1766: Disable timezone changes from the office dashboard settings.
                />
              </div>

              <div className="mb-3">
                <PhoneInputField
                  mt={3}
                  fieldLabel="PHONE"
                  fieldName="office_phone_number"
                  disabled={isSubmitting}
                  showMaskedPlaceholder={false}
                  maxLength={14}
                />
              </div>

              <div className="mb-3">
                <TextInputField
                  mt={0}
                  fieldLabel="REPLY-TO EMAIL"
                  fieldName="office_reply_to_email"
                  type="email"
                  placeholder="Enter reply-to email"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="d-flex mt-4">
                <Button
                  className="secondary-btn me-2"
                  variant="outlined"
                  fullWidth
                  disabled={isSubmitting}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="secondary-btn"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <>
          <Box mb={1}>
            <Typography className="space-top space-bottom" variant="caption">
              OFFICE NAME
            </Typography>
          </Box>
          <div className={styles.formValue}>
            {officeProfile.loaded ? (
              initialValues.office_name
            ) : (
              <Skeleton
                variant="rect"
                animation="wave"
                height={25}
                width="50%"
              />
            )}
          </div>
          <Box mt={3} mb={1}>
            <Typography className="space-top space-bottom" variant="caption">
              OFFICE ADDRESS
            </Typography>
          </Box>
          <div className={styles.formValue}>
            {officeProfile.loaded ? (
              initialValues.office_address ? (
                initialValues.office_address
              ) : (
                <span className={styles.noOfficeData}>N/A</span>
              )
            ) : (
              <Skeleton
                variant="rect"
                animation="wave"
                height={25}
                width="50%"
              />
            )}
          </div>
          <Box mt={3} mb={1}>
            <Typography className="space-top space-bottom" variant="caption">
              TIMEZONE
            </Typography>
          </Box>
          <div className={styles.formValue}>
            {officeProfile.loaded ? (
              initialValues.office_timezone ? (
                `(GMT${moment
                  .utc()
                  .tz(initialValues.office_timezone)
                  .format('Z')}) - ${initialValues.office_timezone}`
              ) : (
                <span className={styles.noOfficeData}>N/A</span>
              )
            ) : (
              <Skeleton
                variant="rect"
                animation="wave"
                height={25}
                width="50%"
              />
            )}
          </div>
          <Box mt={3} mb={1}>
            <Typography className="space-top space-bottom" variant="caption">
              PHONE
            </Typography>
          </Box>
          <div className={styles.formValue}>
            {officeProfile.loaded ? (
              initialValues.office_phone_number ? (
                initialValues.office_phone_number
              ) : (
                <span className={styles.noOfficeData}>N/A</span>
              )
            ) : (
              <Skeleton
                variant="rect"
                animation="wave"
                height={25}
                width="50%"
              />
            )}
          </div>
          <Box mt={3} mb={1}>
            <Typography className="space-top space-bottom" variant="caption">
              REPLY-TO EMAIL
              <CustomTooltip
                title={
                  <div className="d-flex flex-column">
                    <Typography component="p">
                      Emails to patients will use this reply-to address to
                      capture responses
                    </Typography>
                  </div>
                }
                color="#000"
                placement="top-start"
                arrow
                maxWidth={300}
              >
                <HelpOutlineIcon
                  style={{ fontSize: '1rem', marginLeft: '0.25rem' }}
                  htmlColor="#9A9A9A"
                />
              </CustomTooltip>
            </Typography>
          </Box>
          <div className={styles.formValue}>
            {officeProfile.loaded ? (
              initialValues.office_reply_to_email
            ) : (
              <Skeleton
                variant="rect"
                animation="wave"
                height={25}
                width="50%"
              />
            )}
          </div>

          {officeProfile.loaded ? (
            <Button
              className="mt-4"
              size="medium"
              variant="outlined"
              color="primary"
              onClick={() => setIsEditing(true)}
            >
              <EditIcon fill="#02122F" style={{ marginRight: '10px' }} />
              Edit
            </Button>
          ) : (
            <Skeleton
              className="mt-4"
              variant="rect"
              animation="wave"
              height={35}
              width="35%"
            />
          )}
        </>
      )}
    </div>
  );
};

export default observer(OfficeData);
