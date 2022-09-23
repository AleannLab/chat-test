import React from 'react';
import Button from '@material-ui/core/Button';
import Modal from 'components/Core/Modal';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import TextInputField from 'components/Core/Formik/TextInputField';
import InputAdornment from '@material-ui/core/InputAdornment';

const SetGoalModal = ({ goalValue, onSave, onClose }) => {
  const initialValues = {
    goal: goalValue,
  };

  const validationSchema = Yup.object({
    goal: Yup.number()
      .required('Required')
      .min(1, 'Gaol value should be at least 1')
      .max(500000, 'Maximum goal value can be 5,00,000'),
  });

  const handleSubmitForm = async (values, { setSubmitting }) => {
    setSubmitting(true);
    await onSave(values.goal);
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal
      header="Set goal"
      size="xs"
      body={
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmitForm}
          validationSchema={validationSchema}
        >
          {({ isSubmitting }) => {
            return (
              <Form>
                <div className="d-flex flex-column justify-content-center">
                  <TextInputField
                    fieldLabel=""
                    fieldName="goal"
                    type="number"
                    placeholder=""
                    required
                    disabled={isSubmitting}
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </div>

                <div className="mt-4 d-flex justify-space-between">
                  <Button
                    className="primary-btn me-auto"
                    variant="outlined"
                    color="primary"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="secondary-btn"
                    variant="contained"
                    color="secondary"
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      }
      onClose={onClose}
    />
  );
};

export default SetGoalModal;
