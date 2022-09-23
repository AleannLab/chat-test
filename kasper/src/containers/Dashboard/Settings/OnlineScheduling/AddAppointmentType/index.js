import React from 'react';
import Button from '@material-ui/core/Button';
import { observer } from 'mobx-react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import MenuItem from '@material-ui/core/MenuItem';

import Modal from 'components/Core/Modal';
import SelectField from 'components/Core/Formik/SelectField';
import TextInputField from 'components/Core/Formik/TextInputField';
import styles from './index.module.css';

const AddAppointmentType = observer(
  ({ onClose, groups, currentGroupNames, handleAddAppointmentType }) => {
    const initialValues = {
      procedureGroup: 'select_disable',
      displayName: '',
    };

    const validationSchema = Yup.object({
      procedureGroup: Yup.string()
        .required('Required')
        .notOneOf(['select_disable'], 'Please select a group'),
      displayName: Yup.string()
        .required('Required')
        .trim()
        .notOneOf(currentGroupNames, 'Please enter a unique group name'),
    });

    const handleSubmitForm = (e) => {
      handleAddAppointmentType(e.displayName, e.procedureGroup);
    };

    return (
      <Modal
        size="sm"
        header="New Appointment"
        body={
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmitForm}
            validationSchema={validationSchema}
          >
            {({ isSubmitting }) => {
              return (
                <Form>
                  <div className={styles.container}>
                    <p className={styles.subtitle}>
                      Add new appointment option for patients scheduling online.
                    </p>
                    <div className="d-flex flex-column justify-content-center">
                      <SelectField
                        fieldLabel="PROCEDURE GROUP FROM PMS"
                        fieldName="procedureGroup"
                        disabled={isSubmitting}
                        options={groups.map((group) => (
                          <MenuItem
                            key={group.id}
                            value={group.id}
                            disabled={group.value === 'select_disable'}
                          >
                            <span
                              style={{
                                color:
                                  group.value === 'select_disable'
                                    ? '#999999'
                                    : '#02122F',
                              }}
                            >
                              {group.name}
                            </span>
                          </MenuItem>
                        ))}
                      ></SelectField>
                      <TextInputField
                        fieldLabel="DISPLAY NAME"
                        fieldName="displayName"
                        type="text"
                        placeholder=""
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className={styles.footer}>
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
                        Add
                      </Button>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        }
        onClose={onClose}
      />
    );
  },
);

export default AddAppointmentType;
