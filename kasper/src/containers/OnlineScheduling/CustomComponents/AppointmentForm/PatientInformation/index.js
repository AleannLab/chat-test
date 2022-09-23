import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik, Field, Form } from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Checkbox } from 'formik-material-ui';
import moment from 'moment-timezone';
import 'yup-phone';
import TextInputField from 'components/Core/Formik/TextInputField';
import PhoneInputField from 'components/Core/Formik/PhoneInputField';
import DatePickerField from 'components/Core/Formik/DatePickerField';
import TextAreaField from 'components/Core/Formik/TextAreaField';
import SelectField from 'components/Core/Formik/SelectField';
import { useStores } from 'hooks/useStores';
import { ReactComponent as BackIcon } from 'assets/images/back-arrow.svg';
import styles from './index.module.css';

const MIN_BIRTHDAY = '01/01/1880';

const showPaymentProviderMessage = (
  practitioner,
  paymentTypes,
  selectedPaymentId,
) => {
  const selectedPayment = paymentTypes.find(
    (payment) => payment.id === selectedPaymentId,
  );

  return selectedPayment.in_network
    ? `${practitioner.name} is in network, if unsure of exact coverage please confirm prior to visit.`
    : `${practitioner.name} accepts this insurance`;
};

const PatientInformation = () => {
  const { onlineSchedule, notification } = useStores();
  const [appointmentFor, setAppointmentFor] = useState('Myself');

  const SELF_PAY_PAYMENTTYPE = 1;

  let initialValues = {
    paymentType: onlineSchedule.paymentData.selectedPaymentType,
    relativeFirstName: '',
    relativeLastName: '',
    patientFirstName: '',
    patientLastName: '',
    patientDOB: null,
    relativePhone: '',
    patientPhone: '',
    patientEmail: '',
    officeMessage: '',
    agreeTerms: false,
  };

  let validationSchema;
  if (appointmentFor === 'Myself') {
    validationSchema = Yup.object({
      paymentType: Yup.string().required('Required'),
      patientFirstName: Yup.string().trim().required('Required'),
      patientLastName: Yup.string().trim().required('Required'),
      patientDOB: Yup.date()
        .typeError('Invalid date format')
        .required('Required')
        .test(
          'birthday',
          'Cannot be a future date',
          (value) => !moment(value).isAfter(moment()),
        )
        .test(
          'birthday',
          `Birthday should be same or after ${MIN_BIRTHDAY}`,
          (value) => moment(value).isSameOrAfter(moment(MIN_BIRTHDAY)),
        ),
      patientPhone: Yup.string()
        .trim()
        .phone('US', false, 'Invalid phone number'),
      officeMessage: Yup.string().trim(),
      patientEmail: Yup.string()
        .trim()
        .email('Please enter a valid email address')
        .required('Required'),
      agreeTerms: Yup.bool().oneOf(
        [true],
        'Please read and agree to Terms and Services',
      ),
    });
  } else {
    validationSchema = Yup.object({
      paymentType: Yup.string().required('Required'),
      relativeFirstName: Yup.string().trim().required('Required'),
      relativeLastName: Yup.string().trim().required('Required'),
      relativePhone: Yup.string()
        .trim()
        .phone('US', false, 'Invalid phone number'),
      patientFirstName: Yup.string().trim().required('Required'),
      patientLastName: Yup.string().trim().required('Required'),
      patientDOB: Yup.date()
        .typeError('Invalid date format')
        .required('Required')
        .test(
          'birthday',
          'Cannot be a future date',
          (value) => !moment(value).isAfter(moment()),
        )
        .test(
          'birthday',
          `Birthday should be same or after ${MIN_BIRTHDAY}`,
          (value) => moment(value).isSameOrAfter(moment(MIN_BIRTHDAY)),
        ),
      patientPhone: Yup.string()
        .trim()
        .phone('US', false, 'Invalid phone number'),
      patientEmail: Yup.string()
        .trim()
        .email('Please enter a valid email address')
        .required('Required'),
      officeMessage: Yup.string().trim(),
      agreeTerms: Yup.bool().oneOf(
        [true],
        'Please read and agree to Terms and Services',
      ),
    });
  }

  const handleChange = (event) => {
    setAppointmentFor(event.target.value);
  };

  const handleSubmit = (values) => {
    const patientInfo = {
      firstname: values.patientFirstName,
      lastname: values.patientLastName,
      phone: values.patientPhone,
      dob: values.patientDOB,
      email: values.patientEmail,
    };
    let relativeInfo = null;
    if (appointmentFor !== 'Myself') {
      relativeInfo = {
        firstname: values.relativeFirstName,
        lastname: values.relativeLastName,
        phone: values.relativePhone,
      };
    }
    onlineSchedule
      .sendAppointmentForm({
        patient: patientInfo,
        relative: relativeInfo,
        message: values.officeMessage || '',
      })
      .then(() => {
        notification.showSuccess('Appointment booked successfully');
        setTimeout(() => {
          notification.hideNotification();
          onlineSchedule.setFormStatus({
            isSubmitting: false,
            isSubmitted: true,
          });
        }, 2500);
      })
      .catch((err) => {
        if (err.message.includes('not available')) {
          notification.showError(err.message);
          setTimeout(() => {
            notification.hideNotification();
            onlineSchedule.setTimeExpired(true);
            onlineSchedule.setScheduleNow(false);
            onlineSchedule.setFormStatus({
              isSubmitting: false,
              isSubmitted: false,
            });
          }, 3500);
        } else {
          notification.showError(err.message);
        }
      });
  };

  return (
    <div className={styles.container}>
      <Button
        disabled={onlineSchedule.formStatus.isSubmitting}
        onClick={() => onlineSchedule.setScheduleNow(false)}
        className="d-lg-none d-xl-none"
      >
        <BackIcon /> <span className={styles.backText}>Back</span>
      </Button>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, errors }) => (
          <Form>
            <div className={styles.appointmentInfoContainer}>
              <span className={styles.sectionTitle}>Appointment Info</span>
              <SelectField
                mt={1}
                fieldLabel="PAYMENT"
                fieldName="paymentType"
                options={onlineSchedule.paymentData.paymentTypes.map(
                  (payment) => (
                    <MenuItem key={payment.id} value={payment.id}>
                      {payment.name}
                    </MenuItem>
                  ),
                )}
              />
              {values.paymentType !== SELF_PAY_PAYMENTTYPE && (
                <div className={styles.successMessage}>
                  <CheckCircleIcon className={styles.icon} />
                  <span>
                    {showPaymentProviderMessage(
                      onlineSchedule.practitionerData.selectedPractitioner,
                      onlineSchedule.paymentData.paymentTypes,
                      values.paymentType,
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.patientInfoContainer}>
              <span className={styles.sectionTitle}>Contact Info</span>
              <span className={styles.sectionSubtitle}>
                I am scheduling this appointment for:
              </span>
              <RadioGroup
                aria-label="Appointment For"
                name="appointmentFor"
                value={appointmentFor}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="Myself"
                  control={<Radio />}
                  label="Myself"
                  disabled={isSubmitting}
                />
                <FormControlLabel
                  value="Relative"
                  control={<Radio />}
                  label="Someone else"
                  disabled={isSubmitting}
                />
              </RadioGroup>
              {appointmentFor === 'Relative' && (
                <div>
                  <div className={styles.nameSplit}>
                    <div className={styles.inputField}>
                      <TextInputField
                        fieldLabel="YOUR FIRST NAME"
                        fieldName="relativeFirstName"
                        placeholder="First Name"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className={styles.inputField}>
                      <TextInputField
                        fieldLabel="YOUR LAST NAME"
                        fieldName="relativeLastName"
                        placeholder="Last Name"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <PhoneInputField
                    mt={1}
                    fieldLabel="YOUR PHONE NUMBER"
                    fieldName="relativePhone"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
            <div className={styles.patientContactContainer}>
              <span className={styles.sectionTitle}>Patient Info</span>
              <div className={styles.nameSplit}>
                <div className={styles.inputField}>
                  <TextInputField
                    fieldLabel="FIRST NAME"
                    fieldName="patientFirstName"
                    placeholder="First Name"
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.inputField}>
                  <TextInputField
                    fieldLabel="LAST NAME"
                    fieldName="patientLastName"
                    placeholder="Last Name"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className={styles.nameSplit}>
                <div className={styles.inputField}>
                  <DatePickerField
                    mt={2}
                    fieldLabel="BIRTHDAY"
                    fieldName="patientDOB"
                    placeholder="Date of birth"
                    disabled={isSubmitting}
                    minDate={MIN_BIRTHDAY}
                    maxDate={new Date()}
                  />
                </div>
                <div className={styles.inputField}>
                  <PhoneInputField
                    mt={2}
                    fieldLabel="PHONE NUMBER"
                    fieldName="patientPhone"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <TextInputField
                  mt={1}
                  fieldLabel="EMAIL"
                  fieldName="patientEmail"
                  placeholder="Email"
                  disabled={isSubmitting}
                />
                <TextAreaField
                  mt={2}
                  fieldLabel="MESSAGE FOR THE OFFICE (OPTIONAL)"
                  fieldName="officeMessage"
                  placeholder="Message"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className={styles.agreeTermsContainer}>
              <Field
                style={{ padding: '0px' }}
                component={Checkbox}
                type="checkbox"
                name="agreeTerms"
              />
              <span className={styles.agreeTermsText}>
                I agree with{' '}
                <span
                  className={styles.link}
                  onClick={() =>
                    window.open(
                      'https://meetkasper.com/terms-conditions/',
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                >
                  Terms & Conditions
                </span>{' '}
                and{' '}
                <span
                  className={styles.link}
                  onClick={() =>
                    window.open(
                      'https://meetkasper.com/privacy-policy/',
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                >
                  Privacy Policy.
                </span>
              </span>
            </div>
            {errors.agreeTerms && (
              <div className={styles.error}>{errors.agreeTerms}</div>
            )}
            <Button
              disabled={isSubmitting}
              type="submit"
              className="secondary-btn"
              variant="contained"
              color="secondary"
              style={{ marginTop: '2rem' }}
              fullWidth
            >
              Schedule Appointment
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PatientInformation;
