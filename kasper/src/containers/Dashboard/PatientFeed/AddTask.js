import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { compose } from 'recompose';
import * as Yup from 'yup';
import moment from 'moment';
import { useObserver } from 'mobx-react';
import MenuItem from '@material-ui/core/MenuItem';
import { withFormik } from 'formik';
import { useStores } from 'hooks/useStores';
import TextAreaField from 'components/Core/Formik/TextAreaField';
import SelectField from 'components/Core/Formik/SelectField';
import DatePickerField from 'components/Core/Formik/DatePickerField';
import AutoCompleteInputField from 'components/Core/Formik/AutoCompleteInputField';
import { convertCurrentTime } from 'helpers/timezone';
import TagsInputField from 'components/Core/Formik/TagsInputField';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  feildLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;

  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const AddTaskDialog = withStyles(styles)((props) => {
  const {
    handleSubmit,
    // values,
    // setFieldValue,
    isSubmitting,
    // handleChange,
    onCancel,
    // classes,
  } = props;

  // const patientReadOnly = values.patientReadOnly;

  const { categories, users, patients } = useStores();

  const history = useHistory();

  useEffect(() => {
    users.fetchActiveUsers();
  }, [users]);

  return useObserver(() => (
    <div>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} direction="row">
          <Grid item xs={12} className="py-0">
            <TextAreaField
              fieldLabel="TASK NAME"
              fieldName="task_name"
              mt={0}
              maxLength={250}
            />
          </Grid>
          <Grid item xs={6} className="mt-0 mb-0 pb-0">
            <DatePickerField
              fieldLabel="DUE DATE"
              fieldName="due_date"
              mt={0}
            />
          </Grid>
          <Grid item xs={6}>
            <SelectField
              disabled={users.activeUsers.length === 0}
              fieldLabel="ASSIGNED TO"
              fieldName="assigned_to_id"
              mt={0}
              options={users.activeUsers
                .slice()
                .sort((a, b) => {
                  const oldVal = a.username || a.email;
                  const newVal = b.username || b.email;
                  if (newVal.toLocaleLowerCase() < oldVal.toLocaleLowerCase()) {
                    return 1;
                  }
                  if (newVal.toLocaleLowerCase() > oldVal.toLocaleLowerCase()) {
                    return -1;
                  }
                  return 0;
                })
                .map((user, i) => {
                  return (
                    <MenuItem key={i} value={user.id}>
                      {user.username || user.email}
                    </MenuItem>
                  );
                })}
            />
          </Grid>
          <Grid item xs={12} className="py-0 mt-0 mb-0 pb-0">
            <AutoCompleteInputField
              fieldName="patient"
              fieldLabel="PATIENT"
              placeholder="Start typing..."
              getOptionLabel={(item) => item.name}
              onChangeInput={(query) => {
                patients.fetchList({
                  search: query,
                  rows: 100,
                });
              }}
              suggestions={Object.values(patients.getPatientAsTags({}))}
              loading={patients.loading}
            />
          </Grid>
          {/* <Grid item xs={12} className="mt-0 mb-0 pb-0">
            <MultiChipInputField
              fieldName="categories"
              fieldLabel="CATEGORY"
              onChangeInput={(query) => {
                categories.fetchList({
                  search: query,
                  rows: 10,
                });
              }}
              tagComponent={({ tag, removeButtonText, onDelete }) => {
                return (
                  <Chip
                    size="small"
                    style={{ flexDirection: "row-reverse", fontSize: "small" }}
                    label={tag.name}
                    onDelete={onDelete}
                  />
                );
              }}
              suggestions={Object.values(categories.datum)}
              placeholder=""
            />
          </Grid> */}
          <Grid item xs={12} className="mt-0 mb-0 pb-0">
            <TagsInputField
              fieldName="categories"
              fieldLabel="CATEGORY"
              onChangeInput={(query) => {
                categories.fetchList({
                  search: query,
                  rows: 10,
                });
              }}
              placeholder=""
              suggestions={Object.values(categories.datum)}
              suggestionsLimit={Object.keys(categories.datum).length}
            />
          </Grid>
        </Grid>
        <DialogActions style={{ padding: '0px' }}>
          {history.location.pathname.includes('add-task') ? (
            <div className="d-flex justify-content-between w-100 mt-5">
              <Button
                onClick={onCancel}
                className="me-auto"
                variant="outlined"
                color="primary"
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                color="secondary"
                type="submit"
                disabled={isSubmitting}
              >
                Create
              </Button>
            </div>
          ) : null}
          {history.location.pathname.includes('edit-task') ? (
            <div className="d-flex justify-content-between w-100 mt-5">
              <Button
                onClick={onCancel}
                className="primary-btn me-auto"
                variant="outlined"
                color="primary"
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                className="secondary-btn"
                variant="contained"
                color="secondary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          ) : null}
        </DialogActions>
      </form>
    </div>
  ));
});

const AddTaskWithFormik = compose(
  withFormik({
    mapPropsToStatus: (props) => ({
      isDisabled: {},
    }),
    mapPropsToValues: (props) => {
      const { selectedPatient } = props;
      return {
        patientReadOnly: selectedPatient ? true : false,
        assigned_to_id: '',
        due_date: moment(
          convertCurrentTime({
            format: 'LL',
            shouldFormat: true,
          }),
        ),
        task_name: '',
        categories: [],
        patient: selectedPatient
          ? {
              id: selectedPatient.id,
              name: `${selectedPatient.firstname ?? ''}${' '}${
                selectedPatient.lastname ?? ''
              }`.trim(),
            }
          : null,
      };
    },
    validationSchema: Yup.object().shape({
      task_name: Yup.string().trim().nullable().required('Required.'),
      due_date: Yup.date()
        .nullable()
        .typeError('Invalid date')
        .required('Required.'),
      assigned_to_id: Yup.string().nullable().required('Required.'),
    }),
    handleSubmit: async (values, props) => {
      try {
        props.setSubmitting(true);
        await props.props.tasksStore.addTask({
          ...values,
          due_date: moment(values.due_date).format('YYYY-MM-DD'),
          patient: values.patient ?? null,
        });
        props.props.onCancel();
        props.props.notification.showSuccess('Task was added successfully');
      } catch (err) {
        props.props.notification.showError(err.message);
      } finally {
        props.setSubmitting(false);
      }
    },
  }),
)(AddTaskDialog);

const EditTaskWithFormik = compose(
  withFormik({
    mapPropsToStatus: (props) => ({
      isDisabled: {},
    }),
    enableReinitialize: true,
    mapPropsToValues: (props) => {
      let task = props.datum;
      const { selectedPatient } = props;
      return !task
        ? {}
        : {
            patientReadOnly: selectedPatient ? true : false,
            task_id: task.id,
            assigned_to_id: task.assigned_to_id,
            categories: task.categories,
            due_date: moment(task.due_date),
            task_name: task.task_name,
            patient: task.patient
              ? {
                  id: task.patient.id,
                  name: `${task.patient.firstname ?? ''}${' '}${
                    task.patient.lastname ?? ''
                  }`.trim(),
                }
              : null,
          };
    },
    validationSchema: Yup.object().shape({
      task_name: Yup.string().trim().nullable().required('Required.'),
      due_date: Yup.date()
        .nullable()
        .typeError('Invalid date')
        .required('Required.'),
      assigned_to_id: Yup.string().nullable().required('Required.'),
    }),
    handleSubmit: async (values, props) => {
      try {
        props.setSubmitting(true);
        await props.props.tasksStore.editTask({
          ...values,
          due_date: moment(values.due_date).format('YYYY-MM-DD'),
          patient: values.patient || null,
        });
        props.props.onCancel();
        props.props.notification.showSuccess('Task was updated successfully');
      } catch (err) {
        props.props.notification.showError(err.message);
      } finally {
        props.setSubmitting(false);
      }
    },
  }),
)(AddTaskDialog);

const AddOrEditTask = (props) => {
  const { tasks, categories, notification, patientsFeed } = useStores();
  const history = useHistory();

  useEffect(() => {
    categories.fetchList().catch(() => {
      notification.showError(
        'An unexpected error occurred while attempting to fetch the task categories',
      );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [open, setOpen] = useState(true);
  const handleClose = () => {
    setOpen(false);
    history.goBack();
  };

  var task_id;
  var selectedPatient;
  if (history.location.state) {
    task_id = history.location.state.task_id;
    selectedPatient = patientsFeed.selectedPatient || null;
  }

  if (history.location.pathname.includes('edit-task') && !task_id) {
    handleClose();
  }

  return useObserver(() => {
    if (!categories.loaded) return <></>;

    return (
      <Dialog
        className="addEditTask"
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        disableBackdropClick
        style={{
          padding: '50px',
        }}
      >
        <div className="p-4">
          {history.location.pathname.includes('edit-task') ? (
            <>
              <DialogTitle
                id="customized-dialog-title"
                style={{
                  marginTop: '10px',
                  textAlign: 'center',
                }}
                onClose={handleClose}
              >
                <p
                  style={{
                    color: '#0D2145',
                    fontSize: '26px',
                    fontWeight: 'bold',
                    fontFamily: 'Playfair Display',
                  }}
                >
                  Edit Task
                </p>
              </DialogTitle>
              <DialogContent>
                <EditTaskWithFormik
                  // datum={PatientTask.datum}
                  {...props}
                  onCancel={history.goBack}
                  tasksStore={tasks}
                  notification={notification}
                  categoriesStore={categories}
                  datum={tasks.datum[task_id]}
                  selectedPatient={selectedPatient}
                />
              </DialogContent>
            </>
          ) : null}
          {history.location.pathname.includes('add-task') ? (
            <>
              <DialogTitle
                id="customized-dialog-title"
                style={{
                  marginTop: '10px',
                  textAlign: 'center',
                }}
                onClose={handleClose}
              >
                <p
                  style={{
                    color: '#0D2145',
                    fontSize: '26px',
                    fontWeight: 'bold',
                    fontFamily: 'Playfair Display',
                  }}
                >
                  Add Task
                </p>
              </DialogTitle>
              <DialogContent>
                <AddTaskWithFormik
                  {...props}
                  onCancel={history.goBack}
                  categoriesStore={categories}
                  tasksStore={tasks}
                  notification={notification}
                  selectedPatient={selectedPatient}
                />
              </DialogContent>
            </>
          ) : null}
        </div>
      </Dialog>
    );
  });
};

export default AddOrEditTask;
