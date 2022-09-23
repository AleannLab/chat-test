import React from 'react';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { observer } from 'mobx-react-lite';
import { useStores } from 'hooks/useStores';
import TextInputField from 'components/Core/Formik/TextInputField';

const AddNewRoom = observer(({ onClose }) => {
  const { rooms, notification } = useStores();

  const initialValues = { name: '' };

  let validationSchema = Yup.object({
    name: Yup.string().trim().required('Please provide room name'),
  });

  const handleClose = () => onClose();

  return (
    <Modal
      size="sm"
      header="Add New Room"
      body={
        <div className={styles.root}>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmitForm({ rooms, onClose, notification })}
            validationSchema={validationSchema}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <TextInputField
                    fieldLabel="Name"
                    fieldName="name"
                    type="text"
                    placeholder="Enter name"
                    required
                  />
                </div>

                <div className="d-flex justify-content-between mt-5">
                  <Button
                    className="primary-btn me-auto"
                    variant="outlined"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="secondary-btn"
                    variant="contained"
                    color="secondary"
                  >
                    {isSubmitting ? 'Saving...' : `Save`}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      }
      onClose={handleClose}
    />
  );
});

const handleSubmitForm = ({ rooms, onClose, notification }) =>
  async function (val, { setSubmitting, resetForm, setFieldError }) {
    try {
      setSubmitting(true);
      await rooms.add(val);
      notification.showSuccess('Room was added successfully');
      setTimeout(() => {
        notification.hideNotification();
      }, 2500);
      onClose();
    } catch (e) {
      return setFieldError('name', 'Room name already exists');
    } finally {
      setSubmitting(false);
    }
  };

export default AddNewRoom;
