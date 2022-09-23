import React from 'react';
import styles from './index.module.css';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Modal from 'components/Core/Modal';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { observer } from 'mobx-react';
import { Form, Formik } from 'formik';

import { useStores } from 'hooks/useStores';
import * as Yup from 'yup';
import TextInputField from 'components/Core/Formik/TextInputField';
import TextAreaField from 'components/Core/Formik/TextAreaField';

/**
 * Add new section component
 */
const AddNewSection = () => {
  const history = useHistory();
  const { paperlessForm } = useStores();

  const initialValues = {
    section_name: '',
    section_key: '',
    section_JSON: '',
  };

  let validationSchema = Yup.object({
    section_name: Yup.string().trim().required('Name is required'),
    section_key: Yup.string().trim(),
    section_JSON: Yup.string().trim().required('JSON is required'),
  });

  const handleClose = () => {
    history.goBack();
  };

  const handleSubmitForm = async (e) => {
    console.debug(e);
    await paperlessForm.submitForm(
      e.section_name,
      e.section_key,
      e.section_JSON,
    );
  };

  const handleNotificationClose = () => {
    paperlessForm.formAdditionSuccessful = false;
    paperlessForm.formAdditionUnsuccessful = false;
  };

  return (
    <Modal
      size="sm"
      header="Add New Section"
      body={
        <div className={styles.root}>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmitForm}
            validationSchema={validationSchema}
          >
            {({ isSubmitting }) => (
              <Form>
                <TextInputField
                  fieldLabel="SECTION NAME"
                  fieldName="section_name"
                  disabled={isSubmitting}
                />

                <TextInputField
                  mt={2}
                  fieldLabel="SECTION KEY (OPTIONAL)"
                  fieldName="section_key"
                  disabled={isSubmitting}
                />

                <TextAreaField
                  mt={2}
                  rows={15}
                  rowsMax={25}
                  fieldLabel="SECTION JSON"
                  fieldName="section_JSON"
                  disabled={isSubmitting}
                />
                <div className="d-flex justify-content-between mt-5">
                  <Button
                    className="primary-btn me-auto"
                    variant="outlined"
                    color="primary"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="secondary-btn"
                    variant="contained"
                    color="secondary"
                  >
                    Add
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
          {paperlessForm.formAdditionSuccessful && (
            <Snackbar
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={paperlessForm.formAdditionSuccessful}
              onClose={handleNotificationClose}
              autoHideDuration={1500}
            >
              <MuiAlert elevation={6} variant="filled" severity="success">
                Form added successfully!
              </MuiAlert>
            </Snackbar>
          )}
          {paperlessForm.formAdditionUnsuccessful && (
            <Snackbar
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={paperlessForm.formAdditionUnsuccessful}
              onClose={handleNotificationClose}
              autoHideDuration={1500}
            >
              <MuiAlert elevation={6} variant="filled" severity="error">
                Error while adding form!
              </MuiAlert>
            </Snackbar>
          )}
        </div>
      }
      onClose={handleClose}
    />
  );
};

export default observer(AddNewSection);
