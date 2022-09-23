import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

import { useStores } from 'hooks/useStores';
import Modal from 'components/Core/Modal';
import styles from './index.module.css';
import TextInputField from 'components/Core/Formik/TextInputField';

const AddNewGroup = () => {
  const history = useHistory();
  const { formGroups, notification } = useStores();
  const [isAdding, setIsAdding] = useState(false);

  const initialValues = {
    group_name: '',
  };

  let validationSchema = Yup.object({
    group_name: Yup.string().trim().required('Group name is required'),
  });

  const handleClose = () => {
    history.goBack();
  };

  const handleSubmitForm = async (e) => {
    try {
      setIsAdding(true);
      await formGroups.addNewGroup(e['group_name']);
      notification.showSuccess('Group was added successfully');
      setTimeout(() => {
        notification.hideNotification();
        history.goBack();
      }, 2500);
      console.debug(e);
    } catch (err) {
      console.error(err);
      notification.showError(
        'An unexpected error occurred while attempting to add new group',
      );
      setTimeout(() => {
        notification.hideNotification();
        history.goBack();
      }, 3000);
    }
  };

  return (
    <Modal
      size="sm"
      header="Add New Group"
      allowClosing={!isAdding}
      body={
        <div className={styles.root}>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmitForm}
            validationSchema={validationSchema}
          >
            <Form>
              <div className="mb-4">
                <TextInputField
                  fieldLabel="Group Name"
                  fieldName="group_name"
                  type="text"
                  placeholder="Enter group name"
                  disabled={isAdding}
                  required
                />
              </div>

              <div className="d-flex justify-content-between mt-5">
                <Button
                  className="primary-btn me-auto"
                  variant="outlined"
                  color="primary"
                  disabled={isAdding}
                  onClick={handleClose}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="secondary-btn"
                  variant="contained"
                  color="secondary"
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding' : 'Add'}
                </Button>
              </div>
            </Form>
          </Formik>
        </div>
      }
      onClose={handleClose}
    />
  );
};

export default AddNewGroup;
