import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import Grid from '@material-ui/core/Grid';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import { Scrollbars } from 'react-custom-scrollbars';
import { Form, Components } from '@formio/react';
import ConsentForm from '../../ConsentForm';
import components from 'components/FormIO';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';
import './patientForm.css';
import 'formiojs/dist/formio.builder.css';
import 'containers/Dashboard/FormBuilder/Styles/index.css';
import PrintIcon from '@material-ui/icons/Print';
import { useFlags } from 'launchdarkly-react-client-sdk';

Components.setComponents(components);

const FormStepperPreview = ({ formInfo, setShowPrintPreview }) => {
  const { paperlessForm, notification } = useStores();
  const { formsMetaOnly } = useFlags();

  const selectedForms = paperlessForm.selectedSections
    .sort((a, b) => {
      if (a.index < b.index) return -1;
      return a.index > b.index ? 1 : 0;
    })
    .filter((a) => a);

  useEffect(() => {
    if (!paperlessForm.officeInformation.phoneNumber) {
      paperlessForm.fetchOfficeInformation().catch((err) => {
        notification.showError(err.message);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fix for:
  // If more than 2 forms are selected, the user selects a form and unchecks it from form sections,
  // the info of the previous form (which was unchecked and is not present in form preview stepper) still shows
  // this resets it
  useEffect(() => {
    if (paperlessForm.activeStep === 0) {
      paperlessForm.setFormForPreview({
        form: {
          estimatedCompletionTime: 60,
          formKey: 'formConsentDisclosure',
          name: 'Consent Form',
          count: '-',
        },
      });
      paperlessForm.setFilledOutCount('-');
    }
  }, [paperlessForm.activeStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStep = (form, step) => async () => {
    if (form.formKey === 'formConsentDisclosure' || step == 0) {
      paperlessForm.setFilledOutCount('-');
    } else {
      paperlessForm.setFilledOutCount(form.form.count);
      if (formsMetaOnly) {
        form = await paperlessForm.fetchSingleFormById(form.form.formKey);
      }
    }

    paperlessForm.setActiveStep(step);
    paperlessForm.setFormForPreview(form);
  };

  return (
    <div className={`${styles.root} kasper-stepper-root`}>
      <Grid container className={styles.pageBody} justify="center">
        <Grid container className="res-page-section">
          <Grid item xs={12} sm={4} lg={4} className={styles.stepperContainer}>
            <div className={styles.stepperWrapper}>
              <Scrollbars
                style={{ height: '100%' }}
                renderTrackHorizontal={(props) => <div {...props} />}
                renderView={(props) => (
                  <div
                    style={{ ...props.style, marginBottom: '0px' }}
                    className="view"
                  />
                )}
              >
                <Stepper
                  nonLinear
                  activeStep={paperlessForm.activeStep}
                  orientation="vertical"
                  className={styles.stepper}
                >
                  {selectedForms.length > 0
                    ? selectedForms.map((form, index) => (
                        <Step key={index}>
                          <StepButton onClick={handleStep(form, index)}>
                            <div className={styles.stepLabelContainer}>
                              <div className={styles.stepLabel}>
                                {form.form.name}
                              </div>
                              {/* <div
                                className={styles.stepSubLabel}
                              >{`< ${Math.ceil(
                                parseInt(form.form.estimatedCompletionTime) /
                                  60,
                              )} minute(s)`}</div> */}
                            </div>
                          </StepButton>
                        </Step>
                      ))
                    : null}
                </Stepper>
              </Scrollbars>
            </div>
          </Grid>
          <Grid item xs={12} sm={8} lg={8} className={styles.formContainer}>
            <div className={styles.body}>
              <Scrollbars
                style={{ height: '100%' }}
                renderTrackHorizontal={(props) => <div {...props} />}
              >
                <div className={styles.formWrapper}>
                  {formInfo !== undefined &&
                  formInfo?.form?.formKey !== 'formConsentDisclosure' ? (
                    <PrintIcon
                      className={styles.printIcon}
                      onClick={() => {
                        paperlessForm.setPrintingData(formInfo);
                        paperlessForm.printSingleForm();
                        setShowPrintPreview(true);
                      }}
                    />
                  ) : null}
                  {selectedForms.length > 0 ? (
                    paperlessForm.activeStep === 0 ? (
                      <ConsentForm
                        phoneNo={paperlessForm.officeInformation.phoneNumber}
                      />
                    ) : (
                      <Form
                        src={
                          formsMetaOnly
                            ? paperlessForm.selectedFormForPreview.form_json
                            : selectedForms[paperlessForm.activeStep].form
                                .formJson
                        }
                      />
                    )
                  ) : null}
                </div>
              </Scrollbars>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default observer(FormStepperPreview);
