import React, { useState, useEffect } from 'react';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import { Typography, Grid } from '@material-ui/core';
import styles from './index.module.css';
import TagsInputField from 'components/Core/Formik/TagsInputField';
import TextInputField from 'components/Core/Formik/TextInputField';
import { Form, Formik } from 'formik';
import { useStores } from 'hooks/useStores';
import { useMutation } from 'react-query';
import * as Yup from 'yup';

const PatientForm = ({
  onClose,
  isEditPatientForm,
  patientFormData,
  refetchAutomationQueryData,
  selectedPatientType,
  PATIENT_TYPE,
}) => {
  const { paperlessForm, paperlessAutomation, notification } = useStores();
  const [formInitialValues, setFormInitialValues] = useState({
    forms: [],
    form_expiration_period: '',
  });

  const [paperlessFormData, setPaperlessFormData] = useState([]);

  const PatientFormData = {
    [`${PATIENT_TYPE.firstType}`]: {
      title: 'New Patient Forms',
      subTitle: [
        'Below forms will be automatically added for new patients',
        'created in Open Dental.',
      ],
      formLabel: 'NEW PATIENT FORMS TO ADD',
      isPeriod: false,
      periodLabel: '',
    },
    [`${PATIENT_TYPE.secondType}`]: {
      title: 'Returning Patients',
      subTitle: [
        'Below forms will be automatically resent to patients periodically',
        'to update medical info.',
      ],
      formLabel: 'FORMS TO KEEP UP TO DATE',
      isPeriod: true,
      periodLabel: 'UPDATE PERIOD',
    },
  };

  let validationSchema = Yup.object({
    forms: Yup.array()
      .min(1, 'Please select at least one form')
      .required('Please select at least one form'),
  });

  validationSchema = validationSchema.test(
    'form_expiration_period',
    null,
    (value) => {
      if (
        selectedPatientType === PATIENT_TYPE.secondType &&
        !value.form_expiration_period
      ) {
        return new Yup.ValidationError(
          'Required',
          null,
          'form_expiration_period',
        );
      } else if (
        value.form_expiration_period < 1 ||
        value.form_expiration_period > 36
      ) {
        return new Yup.ValidationError(
          'Period should be between 1 and 36',
          null,
          'form_expiration_period',
        );
      }
    },
  );

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (isEditPatientForm) {
      const formsKey = JSON.parse(patientFormData.forms);
      let formsData = [];
      let formExpirationPeriodData =
        patientFormData.form_expiration_period === null
          ? ''
          : patientFormData.form_expiration_period;
      formsKey.forEach((item) => {
        const particularForm = Object.values(paperlessForm.datum).find(
          (ele) => ele.formKey === item,
        );
        if (particularForm !== undefined) {
          formsData.push(particularForm);
        }
      });
      setFormInitialValues({
        ...formInitialValues,
        forms: formsData,
        form_expiration_period: formExpirationPeriodData,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditPatientForm, paperlessForm.datum]);

  const calculateUpdateAutomationPayload = (
    updateAutomationData,
    selectedPatientType,
  ) => {
    let forms = [];
    updateAutomationData.forms.forEach((element) => {
      forms.push(element.formKey);
    });
    const updateAutomationPayload = {
      patientType: selectedPatientType,
      forms: forms,
      id: isEditPatientForm ? patientFormData.id : undefined,
      formExpirationPeriod:
        selectedPatientType === PATIENT_TYPE.firstType
          ? undefined
          : updateAutomationData.form_expiration_period,
      formExpirationPeriodUnit:
        selectedPatientType === PATIENT_TYPE.firstType ? undefined : 'MONTH',
    };
    return paperlessAutomation.addAndUpdateFormAutomation(
      updateAutomationPayload,
    );
  };

  const { mutate: handleSubmitForm } = useMutation(
    (updateAutomationData) => {
      return calculateUpdateAutomationPayload(
        updateAutomationData,
        selectedPatientType,
      );
    },
    {
      onSuccess: () => {
        const successMsg = `${
          selectedPatientType === PATIENT_TYPE.firstType ? 'New' : 'Returning'
        } Patient Forms ${
          isEditPatientForm ? 'updated' : 'added'
        } successfully!`;
        notification.showSuccess(successMsg);
        handleClose();
      },
      onError: (error) => {
        const errorMsg = `An unexpected error occurred while ${
          isEditPatientForm ? 'updating' : 'adding'
        } adding ${
          selectedPatientType === PATIENT_TYPE.firstType ? 'New' : 'Returning'
        } Patient Forms!`;
        notification.showError(error.DetailedMessage || errorMsg);
        handleClose();
      },
      onSettled: () => {
        refetchAutomationQueryData('patientForm');
      },
    },
  );

  useEffect(() => {
    const UnarchivedData = paperlessForm.getAllSectionsByArchiveStatus({
      archived: false,
    });
    setPaperlessFormData(UnarchivedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperlessForm.datum]);

  return (
    <>
      <Modal
        header={PatientFormData[`${selectedPatientType}`].title}
        size="sm"
        body={
          <div>
            <Formik
              enableReinitialize={true}
              initialValues={formInitialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmitForm}
            >
              {({ isSubmitting, values }) => {
                return (
                  <Form>
                    <div>
                      <div className="d-flex flex-column justify-content-center align-items-center">
                        <Typography
                          className={`${styles.subTitle} text-center`}
                        >
                          {PatientFormData[
                            `${selectedPatientType}`
                          ].subTitle.map((subtitleItem, index) => (
                            <>
                              {index !== 0 && <br />} {subtitleItem}{' '}
                            </>
                          ))}
                        </Typography>
                      </div>
                      <div className="mt-5">
                        <Grid item xs={12} className="mt-0 mb-0 pb-0 ">
                          <TagsInputField
                            fieldName="forms"
                            fieldLabel={
                              PatientFormData[`${selectedPatientType}`]
                                .formLabel
                            }
                            onChangeInput={(query) => {
                              paperlessForm.fetchList({
                                search: query,
                                refreshList: true,
                                rows: 10,
                              });
                            }}
                            placeholder=""
                            suggestions={paperlessFormData}
                            allowNew={false}
                            suggestionsLimit={paperlessFormData.length}
                          />
                        </Grid>
                      </div>
                      {selectedPatientType === PATIENT_TYPE.secondType && (
                        <div className="mt-3">
                          <Grid
                            container
                            spacing={2}
                            className="d-flex align-items-center"
                          >
                            <Grid item xs={5}>
                              <TextInputField
                                fieldLabel="UPDATE PERIOD"
                                fieldName="form_expiration_period"
                                type="number"
                                mt={0}
                                placeholder="Enter Period"
                                disabled={isSubmitting}
                                required
                              />
                            </Grid>
                            <Grid item xs={7} className="mt-3">
                              <Typography className={styles.subTitle}>
                                months since last form submission
                              </Typography>
                            </Grid>
                          </Grid>
                        </div>
                      )}
                    </div>
                    <div className="d-flex justify-content-between w-100 mt-4">
                      <Button
                        className="primary-btn me-auto"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleClose()}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? `Saving...` : `Save`}
                      </Button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        }
        footer={<></>}
        onClose={handleClose}
      />
    </>
  );
};

export default PatientForm;
