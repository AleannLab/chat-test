import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, MenuItem } from '@material-ui/core';
import Modal from 'components/Core/Modal';
import TextAreaField from 'components/Core/Formik/TextAreaField';
import DatePickerField from 'components/Core/Formik/DatePickerField';
import SelectField from 'components/Core/Formik/SelectField';
import AutoCompleteInputField from 'components/Core/Formik/AutoCompleteInputField';
import TagsInputField from 'components/Core/Formik/TagsInputField';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useStores } from 'hooks/useStores';
import { useMutation, useQuery } from 'react-query';
import { useMemo } from 'react';
import { convertCurrentTime } from 'helpers/timezone';
import moment from 'moment';

const validationSchema = Yup.object().shape({
  task_name: Yup.string().trim().nullable().required('Required.'),
  due_date: Yup.date()
    .nullable()
    .typeError('Invalid date')
    .required('Required.'),
  assigned_to_id: Yup.string().nullable().required('Required.'),
});

const AddEditTask = ({
  task,
  onClose,
  activeUsers,
  afterAddOrEdit,
  patientInContext,
}) => {
  const {
    patients: patientsStore,
    categories: categoriesStore,
    tasks: tasksStore,
  } = useStores();
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  const { data: patients = [], isFetching: isFetchingPatients } = useQuery(
    ['fetchPatients', patientSearchQuery],
    () =>
      patientsStore.fetchListQuery({
        search: patientSearchQuery,
        rows: 10,
      }),
  );

  const { data: categories = [] } = useQuery(['fetchCategories'], () =>
    categoriesStore.fetchListQuery(),
  );

  const { mutate: addTaskMutation } = useMutation(
    (task) => tasksStore.addTaskQuery(task),
    {
      onSuccess: () => {
        afterAddOrEdit();
        onClose();
      },
    },
  );

  const { mutate: editTaskMutation } = useMutation(
    (task) => tasksStore.editTaskQuery(task),
    {
      onSuccess: () => {
        afterAddOrEdit();
        onClose();
      },
    },
  );

  const patientTags = useMemo(() => {
    return patients.map((patient) => ({
      id: patient.id,
      name: `${patient.firstname ?? ''}${' '}${patient.lastname ?? ''}`.trim(),
    }));
  }, [patients]);

  const sortedActiveUsers = useMemo(() => {
    if (!activeUsers.length) return [];
    return activeUsers.slice().sort((a, b) => {
      const oldVal = a.username || a.email;
      const newVal = b.username || b.email;
      if (newVal.toLocaleLowerCase() < oldVal.toLocaleLowerCase()) {
        return 1;
      }
      if (newVal.toLocaleLowerCase() > oldVal.toLocaleLowerCase()) {
        return -1;
      }
      return 0;
    });
  }, [activeUsers]);

  const initialValues = useMemo(() => {
    const {
      task_name = '',
      assigned_to_id = '',
      patient = patientInContext || null,
      due_date = convertCurrentTime({
        format: 'LL',
        shouldFormat: true,
      }),
      categories = [],
    } = task || {};
    return {
      task_name,
      assigned_to_id,
      patient: patient
        ? {
            id: patient.id,
            name: `${patient.firstname ?? ''}${' '}${
              patient.lastname ?? ''
            }`.trim(),
          }
        : null,
      due_date,
      categories,
    };
  }, [task, patientInContext]);

  return (
    <Modal
      header={`${!task ? 'Add' : 'Edit'} Task`}
      size="sm"
      body={
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            const payload = {
              ...values,
              due_date: moment(values.due_date).format('YYYY-MM-DD'),
              patient: values.patient ?? null,
            };
            if (!task) {
              addTaskMutation(payload);
            } else {
              editTaskMutation({ ...payload, task_id: task.id });
            }
          }}
          validationSchema={validationSchema}
        >
          {({ isSubmitting, values }) => {
            console.log(values);
            return (
              <Form>
                <Grid container spacing={3} direction="row">
                  <Grid item xs={12}>
                    <TextAreaField
                      fieldLabel="TASK NAME"
                      fieldName="task_name"
                      mt={0}
                      maxLength={250}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePickerField
                      fieldLabel="DUE DATE"
                      fieldName="due_date"
                      disabled={isSubmitting}
                      mt={0}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <SelectField
                      disabled={sortedActiveUsers.length === 0 || isSubmitting}
                      fieldLabel="ASSIGNED TO"
                      fieldName="assigned_to_id"
                      mt={0}
                      options={sortedActiveUsers.map((user, i) => {
                        return (
                          <MenuItem key={i} value={user.id}>
                            {user.username || user.email}
                          </MenuItem>
                        );
                      })}
                    />
                  </Grid>
                  {!patientInContext && (
                    <Grid item xs={12}>
                      <AutoCompleteInputField
                        fieldName="patient"
                        fieldLabel="PATIENT"
                        placeholder="Start typing..."
                        getOptionLabel={(item) => item.name}
                        onChangeInput={(query) => {
                          setPatientSearchQuery(query);
                        }}
                        suggestions={patientTags}
                        loading={isFetchingPatients}
                        disabled={isSubmitting}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TagsInputField
                      fieldName="categories"
                      fieldLabel="CATEGORY"
                      placeholder=""
                      suggestions={categories} //{Object.values(categories.datum)}
                    />
                  </Grid>
                </Grid>
                <div className="d-flex justify-content-between mt-5 w-100">
                  <Button
                    className="primary-btn mr-auto"
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
                    {!task ? 'Create' : 'Save'}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      }
      onClose={onClose}
    ></Modal>
  );
};

export default AddEditTask;
