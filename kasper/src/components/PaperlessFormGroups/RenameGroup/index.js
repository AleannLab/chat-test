import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

import { useStores } from 'hooks/useStores';
import Modal from 'components/Core/Modal';
import styles from './index.module.css';
import TextInputField from 'components/Core/Formik/TextInputField';

const RenameGroup = (props) => {
  const history = useHistory();
  const { formGroups, notification } = useStores();
  const [isRenaming, setIsRenaming] = useState(false);

  const initialValues = {
    group_name: props.match.params.originalName,
  };

  let validationSchema = Yup.object({
    group_name: Yup.string().trim().required('Required.'),
  });

  const handleClose = () => {
    history.goBack();
  };

  const handleSubmitForm = async (e) => {
    setIsRenaming(true);
    try {
      const response = await formGroups.renameGroup(
        props.match.params.id,
        e['group_name'],
      );

      response.success
        ? notification.showSuccess('Group was renamed successfully')
        : notification.showInfo(response.error.DetailedMessage);

      setTimeout(() => {
        notification.hideNotification();
        history.goBack();
      }, 2500);
    } catch (err) {
      console.error(err);
      notification.showError(
        'An unexpected error occurred while attempting to rename the group',
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
      header="Rename Group"
      allowClosing={!isRenaming}
      body={
        <div className={styles.root}>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmitForm}
            validationSchema={validationSchema}
          >
            <Form>
              <TextInputField
                fieldName="group_name"
                fieldLabel="Group Name"
                disabled={isRenaming}
              />
              <div className="d-flex justify-content-between mt-5">
                <Button
                  className="primary-btn me-auto"
                  variant="outlined"
                  color="primary"
                  disabled={isRenaming}
                  onClick={handleClose}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="secondary-btn"
                  variant="contained"
                  color="secondary"
                  disabled={isRenaming}
                >
                  {isRenaming ? 'Renaming' : 'Rename'}
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

export default RenameGroup;
