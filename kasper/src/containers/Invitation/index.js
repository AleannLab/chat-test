import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { observer } from 'mobx-react';
import Grid from '@material-ui/core/Grid';
import Avatar from 'components/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import { Scrollbars } from 'react-custom-scrollbars';
import { Form, Components } from '@formio/react';
import { useParams, Prompt } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import components from 'components/FormIO';
import { useStores } from 'hooks/useStores';
import AllFormsSubmitted from 'components/AllFormsSubmitted';
import Loader from 'components/Core/Loader';
import { ReactComponent as PoweredByKasper } from 'assets/images/powered-by-kasper.svg';
import styles from './index.module.css';
import './patientForm.css';
import 'formiojs/dist/formio.builder.css';
import 'containers/Dashboard/FormBuilder/Styles/index.css';
import ConsentForm from './ConsentForm';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import IconButton from '@material-ui/core/IconButton';
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import useResponsive from 'hooks/useResponsive';
import Notification from 'components/Notification';
import Skeleton from '@material-ui/lab/Skeleton';
import EditConfirmationModal from './EditConfirmationModal';
import CONSTANTS from 'helpers/constants';
import ConfirmLeaveFormModal from './ConfirmLeaveFormModal';
import { formTranslations } from 'helpers/formTranslations';
import LanguageMenu from 'components/Core/LanguageMenu';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { useQuery } from 'react-query';
import Logo from 'assets/images/kasper_default_logo.svg';
import { DEFAULT_APP_HEADER_IMAGE } from 'helpers/constants';

Components.setComponents(components);

const PatientForm = observer(() => {
  const scrollbar = useRef(null);
  const { patientForm, notification } = useStores();
  const params = useParams();
  const responsiveInfo = useResponsive();

  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [stepperDrawerOpen, setStepperDrawerOpen] = useState(false);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [stepToProceed, setStepToProceed] = useState(0);
  const [isFormUpdated, setIsFormUpdated] = useState(false);
  const [isNavigationBlocked, setIsNavigationBlocked] = useState(false);
  const [language, setLanguage] = useState('en');
  const { allowFormLanguageTranslation } = useFlags();

  useEffect(() => {
    patientForm.fetchOfficeInformation(params.invite).catch((err) => {
      notification.showError(err.message);
    });
    patientForm.fetchPatientForm(params.invite).catch((e) => {
      notification.showError(e.message);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsFormUpdated(false);
  }, [patientForm.activeStep]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsNavigationBlocked(!!isFormUpdated);
  }, [isFormUpdated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle window close, refresh, and browser back events using onbeforeunload event handler
  useEffect(() => {
    window.onbeforeunload = isNavigationBlocked ? () => true : null;

    return () => {
      window.onbeforeunload = null;
    };
  }, [isNavigationBlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    !!isSubmissionComplete && setIsNavigationBlocked(false);
  }, [isSubmissionComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // React query to fetch office details
  const {
    data: queryData,
    isFetching,
    isSuccess,
  } = useQuery('officeDetails', () => patientForm.fetchOfficeInformation(), {
    initialData: {
      office_brand_color: '#0D2145',
    },
    onError: (err) => {
      notification.showError(err.message);
    },
  });

  const patchUrl = (formJSON) => {
    let stringified = JSON.stringify(formJSON);
    const tenantId =
      CONSTANTS.TEST_TENANT_ID || window.location.hostname.split('.')[0];
    stringified = stringified.replace(/@@tenantId/g, tenantId);
    stringified = stringified.replace(/@@stageEnv/g, CONSTANTS.ENV);
    return formJSON ? JSON.parse(stringified) : null;
  };

  if (patientForm.isFormAlreadySubmitted) {
    patientForm.invitation.data.forEach((form, index) => {
      patientForm.setCompleted(index);
    });
  }

  const totalSteps = () => {
    return patientForm.formGroup.length;
  };

  const completedSteps = () => {
    const completed = Object.values(patientForm.completed).filter(
      (value) => value,
    );
    return completed.length;
  };

  const isLastStep = () => {
    return patientForm.activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleContinue = useCallback(
    async (e) => {
      try {
        // TODO: KAS-3118: This is temporary logic, revisit it later
        if (
          e.data?.FORM_SAVEmedical_conditions &&
          !Array.isArray(e.data?.FORM_SAVEmedical_conditions)
        ) {
          e.data.FORM_SAVEmedical_conditions =
            e.data.FORM_SAVEmedical_conditions.split(',');
        }

        await patientForm.submitForm(
          patientForm.invitation.data[patientForm.activeStep].formkey,
          params.invite,
          e.data,
        );
        let newActiveStep =
          isLastStep() && !allStepsCompleted()
            ? patientForm.formGroup.findIndex(
                (_, i) => !(i in patientForm.completed),
              )
            : patientForm.activeStep + 1;
        patientForm.setCompleted(patientForm.activeStep);
        scrollbar.current.scrollToTop();
        let iterable = 0;
        if (!allStepsCompleted()) {
          while (patientForm.completed[iterable]) {
            iterable += 1;
          }
          newActiveStep = iterable;
        }
        patientForm.setActiveStep(newActiveStep);
        if (allStepsCompleted()) {
          try {
            await patientForm.submissionComplete(params.invite);
            setIsSubmissionComplete(true);
          } catch (err) {
            patientForm.submissionUnsuccessful = true;
            setTimeout(() => {
              patientForm.submissionUnsuccessful = false;
            }, 3000);
          }
        }
      } catch (err) {
        patientForm.submissionUnsuccessful = true;
        setTimeout(() => {
          patientForm.submissionUnsuccessful = false;
        }, 3000);
      }
    },
    [patientForm.activeStep], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleStep = (step) => () => {
    if (step !== patientForm.activeStep) {
      if (patientForm.completed[step] && step !== 0) {
        setShowEditConfirmation(true);
        setStepToProceed(step);
      } else {
        if (isFormUpdated) {
          setStepToProceed(step);
          setConfirmStep(true);
        } else {
          confirmProceed(step);
        }
      }
    }
  };

  const confirmProceed = (step) => {
    if (patientForm.completed[step]) {
      patientForm.setCompleted(step, false);
    }
    patientForm.setIsFormAlreadySubmitted(false);
    patientForm.setIsPatientRefilling(true);
    patientForm.setActiveStep(step);
    responsiveInfo.isMobile && setStepperDrawerOpen(false);
    setConfirmStep(false);
    setShowEditConfirmation(false);
    scrollbar.current.scrollToTop();
  };

  const handleCloseConfirmationDialog = () => {
    setConfirmStep(false);
  };

  const handleNotificationClose = () => {
    patientForm.submissionSuccessful = false;
    patientForm.submissionUnsuccessful = false;
  };

  const steps = (
    <div className={styles.stepperWrapper}>
      <Scrollbars
        style={{ height: '90%' }}
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
          activeStep={patientForm.activeStep}
          orientation="vertical"
          className={styles.stepper}
        >
          {patientForm.formGroup.map((step, index) => (
            <Step key={index}>
              {index === 0 ? (
                <StepButton
                  onClick={handleStep(index)}
                  completed={patientForm.completed[index]}
                  disabled={
                    false ||
                    patientForm.isFormAlreadySubmitted ||
                    isSubmissionComplete
                  }
                >
                  <div className={styles.stepLabelContainer}>
                    <div className={styles.stepLabel}>{step.name}</div>
                    <div className={styles.stepSubLabel}>
                      {step.description}
                    </div>
                  </div>
                </StepButton>
              ) : (
                <StepButton
                  onClick={handleStep(index)}
                  completed={patientForm.completed[index]}
                  disabled={!patientForm.isAgreed || isSubmissionComplete}
                >
                  <div className={styles.stepLabelContainer}>
                    <div className={styles.stepLabel}>{step.name}</div>
                    <div className={styles.stepSubLabel}>
                      {step.description}
                    </div>
                  </div>
                </StepButton>
              )}
            </Step>
          ))}
        </Stepper>
      </Scrollbars>
      <div className={styles.kapsperLogo}>
        <PoweredByKasper />
      </div>
    </div>
  );

  const formSourceFormSubmissionMapper = useMemo(() => {
    if (
      !!patientForm &&
      !!patientForm.singleFormData &&
      patientForm.activeStep
    ) {
      let prefilledData = {};
      patientForm.invitation.data[patientForm.activeStep].formFields.forEach(
        (form) => {
          for (const [originalKey, originalValue] of Object.entries(form)) {
            for (const [newKey, newValue] of Object.entries(
              patientForm.singleFormData.data.merged_form_submission_data,
            )) {
              if (originalKey === 'key') {
                if (originalValue === newKey) {
                  prefilledData[originalValue] = newValue;
                }
              }
            }
          }
        },
      );
      if (
        Object.keys(patientForm.singleFormData.data.merged_form_submission_data)
          .length > 0
      ) {
        return {
          data: prefilledData,
        };
      } else {
        return { data: patientForm.singleFormData.data.SQL_formData };
      }
    }
  }, [patientForm.activeStep]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`${styles.root} kasper-stepper-root`}>
      <Grid
        container
        className={styles.pageHeader}
        justify="center"
        style={{
          background: `url('${
            isSuccess && queryData?.office_cover_pic_url?.url
              ? queryData.office_cover_pic_url.url
              : DEFAULT_APP_HEADER_IMAGE
          }')`,
        }}
      >
        <Grid container className="res-page-section">
          {allowFormLanguageTranslation && (
            <LanguageMenu
              className={styles.languageMenuBtn}
              onChange={(val) => setLanguage(val)}
            />
          )}

          {/* <Grid container item xs={8} alignContent="center"> */}
          <AvatarGroup>
            {isFetching ? (
              <Skeleton
                variant="rect"
                animation="wave"
                height={'5rem'}
                width={'5rem'}
              />
            ) : (
              <Avatar
                id={0}
                src={
                  queryData?.office_profile_pic_url?.url
                    ? queryData.office_profile_pic_url.url
                    : Logo
                }
                className={styles.docImage}
                variant="rounded"
              />
            )}
          </AvatarGroup>
          {patientForm.invitation.loading ? (
            <div className="d-flex flex-column justify-content-center ps-4">
              <Skeleton
                variant="rect"
                animation="wave"
                height={17}
                width={160}
                className="mb-2"
              />
              <Skeleton
                variant="rect"
                animation="wave"
                height={10}
                width={100}
              />
            </div>
          ) : (
            <div className="d-flex flex-column justify-content-center ps-4">
              <div className={styles.docName}>
                <>{patientForm.officeInformation.officeName}</>
              </div>
              <div className={styles.docSubInfo}>
                We are looking forward to seeing you!
              </div>
            </div>
          )}
          {/* </Grid> */}
        </Grid>
      </Grid>
      <Grid container className={styles.pageBody} justify="center">
        <Grid container className="res-page-section">
          {responsiveInfo.isMobile ? (
            <SwipeableDrawer
              anchor="left"
              open={stepperDrawerOpen}
              onClose={() => setStepperDrawerOpen(false)}
              onOpen={() => setStepperDrawerOpen(true)}
              className="kasper-stepper-drawer"
            >
              {steps}
            </SwipeableDrawer>
          ) : (
            <Grid
              item
              xs={12}
              sm={4}
              lg={3}
              className={styles.stepperContainer}
            >
              {steps}
            </Grid>
          )}
          <Grid
            container
            item
            xs={12}
            sm={8}
            lg={9}
            direction="column"
            className={styles.formContainer}
          >
            {responsiveInfo.isMobile && (
              <IconButton
                style={{ position: 'fixed' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setStepperDrawerOpen(true);
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
            )}
            <div className={styles.body}>
              <Scrollbars
                style={{ height: '100%' }}
                ref={scrollbar}
                renderTrackHorizontal={(props) => <div {...props} />}
              >
                <div className={styles.formWrapper}>
                  {patientForm.invitation.data ? (
                    !allStepsCompleted() &&
                    !patientForm.isFormAlreadySubmitted ? (
                      patientForm.activeStep === 0 ? (
                        <>
                          <ConsentForm
                            firstName={patientForm.firstName}
                            onSubmit={() => scrollbar.current.scrollToTop()}
                            phoneNo={patientForm.officeInformation.phoneNumber}
                          />
                        </>
                      ) : patientForm.singleFormData ? (
                        <Form
                          options={{
                            noAlerts: true,
                            language: language,
                            i18n: { ...formTranslations },
                          }}
                          src={patchUrl(
                            patientForm.invitation.data[patientForm.activeStep]
                              .form,
                          )}
                          onChange={(e) => {
                            if (e.changed) {
                              setIsFormUpdated(true);
                            }
                          }}
                          submission={formSourceFormSubmissionMapper}
                          onSubmit={handleContinue}
                        />
                      ) : null
                    ) : (
                      <AllFormsSubmitted />
                    )
                  ) : (
                    <Loader />
                  )}

                  {!responsiveInfo.isDesktop && (
                    <div
                      style={{
                        height: '20rem',
                        visibility: 'hidden',
                      }}
                    />
                  )}
                </div>
              </Scrollbars>
            </div>
            {/* <div className="mt-auto ms-auto pb-3 pe-3">
                            {
                                completedSteps() === totalSteps() - 1
                                    ? <Button variant="contained" color="secondary" size="large" onClick={handleReset}>Finish</Button>
                                    : <Button variant="contained" color="secondary" size="large" onClick={handleContinue}>Continue</Button>
                            }
                        </div> */}
          </Grid>
        </Grid>
        {patientForm.submissionSuccessful && (
          <Snackbar
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={patientForm.submissionSuccessful}
            onClose={handleNotificationClose}
            autoHideDuration={1500}
          >
            <MuiAlert elevation={6} variant="filled" severity="success">
              Form(s) submission was successful
            </MuiAlert>
          </Snackbar>
        )}
        {patientForm.submissionUnsuccessful && (
          <Snackbar
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={patientForm.submissionUnsuccessful}
            onClose={handleNotificationClose}
            autoHideDuration={3000}
          >
            <MuiAlert elevation={6} variant="filled" severity="error">
              An unexpected error occurred while attempting to submit the
              form(s)
            </MuiAlert>
          </Snackbar>
        )}
        <Notification />
      </Grid>

      {/* Confirmation prompt to be displayed on route change */}
      <Prompt
        when={isNavigationBlocked}
        message="You have unsaved changes, are you sure you want to leave?"
      />

      {/* Confirmation prompt to be displayed when a user tries to edit a form that is already submitted */}
      {showEditConfirmation && (
        <EditConfirmationModal
          onOk={() => confirmProceed(stepToProceed)}
          onCancel={() => setShowEditConfirmation(false)}
        />
      )}

      {/* Confirmation prompt to be displayed when a user leaves a form without submitting */}
      {confirmStep && (
        <ConfirmLeaveFormModal
          onOk={() => confirmProceed(stepToProceed)}
          onCancel={handleCloseConfirmationDialog}
        />
      )}
    </div>
  );
});

export default PatientForm;
