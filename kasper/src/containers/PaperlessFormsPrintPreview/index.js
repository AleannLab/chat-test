import React from 'react';
import { observer } from 'mobx-react';
import Grid from '@material-ui/core/Grid';
import { Form, Components } from '@formio/react';
import components from 'components/FormIO';
import { useStores } from 'hooks/useStores';
import 'components/PaperlessFormPreview/FormStepperPreview/patientForm.css';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useFlags } from 'launchdarkly-react-client-sdk';
import Notification from 'components/Notification';
import Header from './Header';

import 'formiojs/dist/formio.builder.css';
import 'containers/Dashboard/FormBuilder/Styles/index.css';
import styles from './index.module.css';
import './formioOverride.css';

Components.setComponents(components);

window.HubSpotConversations.widget.remove();

const PaperlessFormPrintPreview = () => {
  const { paperlessForm, notification } = useStores();
  const location = useLocation();
  const featureFlag = useFlags();
  const queryParams = new URLSearchParams(location.search);
  const formId = queryParams.get('formId');
  const secret = queryParams.get('secret');
  const formSpecific = queryParams.get('formSpecific');

  const fetchFormQuery = useQuery(
    'fetchForm',
    () => paperlessForm.fetchFormForPrintPreview(formId, secret, formSpecific),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  return (
    <>
      <div
        className={`${styles.root} print-preview-root print-preview-override ${
          !featureFlag.paperlessFormsPrintEnableColumnLayout
            ? 'print-preview-col-layout'
            : ''
        }`}
      >
        <Grid container className={styles.pageBody} justify="center">
          <Grid container className="res-page-section">
            <Grid item xs={12} className={styles.formContainer}>
              <div className={styles.body}>
                <div style={{ overflow: 'scroll', height: '100%' }}>
                  <div
                    className={`${styles.formWrapper} ${
                      fetchFormQuery.isSuccess && !paperlessForm.isFetching
                        ? 'visible'
                        : 'invisible'
                    }`}
                  >
                    <Header />
                    {fetchFormQuery.isFetching ? null : !fetchFormQuery.data
                        .formData ? (
                      <Form src={fetchFormQuery.data.form.form_json} />
                    ) : (
                      <Form
                        src={fetchFormQuery.data.form.form_json}
                        submission={fetchFormQuery.data.formData}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Notification />
    </>
  );
};

export default observer(PaperlessFormPrintPreview);
