import React from 'react';
import Grid from '@material-ui/core/Grid';
import { Form, Components } from '@formio/react';
import components from 'components/FormIO';
import { useStores } from 'hooks/useStores';
import 'components/PaperlessFormPreview/FormStepperPreview/patientForm.css';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import Loader from 'components/Core/Loader';
import Notification from 'components/Notification';

import 'formiojs/dist/formio.builder.css';
import 'containers/Dashboard/FormBuilder/Styles/index.css';
import styles from './index.module.css';
Components.setComponents(components);

const FormStepperPreview = () => {
  const { paperlessForm, notification } = useStores();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const token = queryParams.get('token');
  const formId = queryParams.get('formId');

  const fetchFormQuery = useQuery(
    'fetchForm',
    () => paperlessForm.fetchFormById(formId, token),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  return (
    <>
      <div className={`${styles.root} kasper-stepper-root`}>
        <Grid container className={styles.pageBody} justify="center">
          <Grid container className="res-page-section">
            <Grid item xs={12} className={styles.formContainer}>
              <div className={styles.body}>
                <div style={{ overflow: 'scroll', height: '100%' }}>
                  <div className={styles.formWrapper}>
                    {fetchFormQuery.isFetching ? (
                      <Loader />
                    ) : (
                      <Form src={fetchFormQuery.data} />
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

export default FormStepperPreview;
