import React, { useMemo, useState, useEffect } from 'react';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { useQuery, useQueryClient } from 'react-query';
import moment from 'moment';
import { convertCurrentTime } from 'helpers/timezone';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import AutoCompleteInputField from 'components/Core/Formik/AutoCompleteInputField';
import SelectField from 'components/Core/Formik/SelectField';
import MenuItem from '@material-ui/core/MenuItem';
import DatePickerField from 'components/Core/Formik/DatePickerField';
import TimePickerField from 'components/Core/Formik/TimePickerField';
import TagsInputField from 'components/Core/Formik/TagsInputField';
import Skeleton from '@material-ui/lab/Skeleton';
import CustomTooltip from 'components/Core/Tooltip';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';

// Form validation schema
const validationSchema = Yup.object({
  patient: Yup.string().nullable().required('Please select a patient'),
  practitioner: Yup.number().required('Please set provider'),
  appointmentDate: Yup.string()
    .trim()
    .required('Please provide appointment date'),
  startTime: Yup.string().trim().required('Please provide start time'),
  status: Yup.number().required('Please set appointment status'),
  procedures: Yup.array()
    .min(1, 'Please select at least one procedure')
    .required('Please select at least one procedure'),
  operatory: Yup.string().required('Please select an operatory'),
});

const AppointmentForm = ({
  appointmentId = null,
  onFormSubmit,
  onFormCancel,
}) => {
  const queryClient = useQueryClient();
  const { patients, scheduling: schedulingStore } = useStores();
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  // List of patients provided to to patient form field filtered as per given search text
  const filteredPatients = useMemo(() => {
    setIsLoadingPatients(false);
    return Object.values(patients.getPatientAsTags({}));
  }, [patients.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get cached data for appointment status definitions
  const cachedStatusDefinitions = queryClient.getQueryData('statusDefinitions');

  // react-query for appointment status definitions
  const statusDefinitions = useQuery(
    'statusDefinitions',
    () => schedulingStore.getStatusDefinitions(),
    {
      enabled: !cachedStatusDefinitions, // Fetch data only if cached data is not present
      initialData: cachedStatusDefinitions,
    },
  );

  // Get cached data for practitioner definitions
  const cachedPractitionerDefinitions = queryClient.getQueryData(
    'practitionerDefinitions',
  );

  // react-query for practitioner definitions
  const practitionerDefinitions = useQuery(
    'practitionerDefinitions',
    () => schedulingStore.getPractitioners(),
    {
      enabled: !cachedPractitionerDefinitions, // Fetch data only if cached data is not present
      initialData: cachedPractitionerDefinitions,
    },
  );

  // Get cached data for practitioner definitions
  const cachedProcedureDefinitions = queryClient.getQueryData(
    'procedureDefinitions',
  );

  // react-query for procedure definitions
  const procedureDefinitions = useQuery(
    'procedureDefinitions',
    () => schedulingStore.getProcedures(),
    {
      enabled: !cachedProcedureDefinitions, // Fetch data only if cached data is not present
      initialData: cachedProcedureDefinitions,
    },
  );

  // Get cached operatories
  const cachedOperatories = queryClient
    .getQueryData('operatories')
    .filter(({ isHidden }) => !isHidden);

  // react-query for operatories
  const operatoriesQuery = useQuery(
    'operatories',
    () => schedulingStore.getOperatories(),
    {
      enabled: !cachedOperatories, // Fetch data only if cached data is not present
      initialData: cachedOperatories,
    },
  );

  // Get cached data for selected appointment
  const cachedAppointmentData =
    appointmentId &&
    queryClient.getQueryData([
      'officeAppointments',
      schedulingStore.currentDate,
    ]);

  // Dynamically set form initial values
  useEffect(
    () => {
      if (
        !!appointmentId &&
        !!cachedAppointmentData &&
        procedureDefinitions.isSuccess
      ) {
        const data = cachedAppointmentData.find(
          ({ id }) => id === appointmentId,
        );
        setFormInitialValues({
          patient: data.patient,
          practitioner: data.practitionerId,
          appointmentDate: moment(data.startDate),
          startTime: moment(data.startDate),
          status: data.status,
          procedures: data.procedures
            ? data.procedures.map(({ id: procId }) =>
                procedureDefinitions.data.find(({ id }) => id === procId),
              )
            : [],
          operatory: data.operatory,
        });
      } else {
        setFormInitialValues({
          patient: null,
          practitioner: practitionerDefinitions.isSuccess
            ? practitionerDefinitions.data[0].id
            : null,
          appointmentDate: convertCurrentTime({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          startTime: convertCurrentTime({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          status: statusDefinitions.isSuccess
            ? statusDefinitions.data[0].id
            : null,
          procedures: [],
          operatory: operatoriesQuery.isSuccess
            ? operatoriesQuery.data[0].id
            : null,
        });
      }
    },
    // prettier-ignore
    [appointmentId, cachedAppointmentData, practitionerDefinitions, statusDefinitions, procedureDefinitions,], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // react-query for selected appointment data
  // prettier-ignore
  // eslint-disable-next-line no-unused-vars
  const appointmentData = useQuery( // NOSONAR
    'officeAppointments',
    () => schedulingStore.getAppointments(schedulingStore.currentDate),
    {
      enabled: !!appointmentId && !cachedAppointmentData, // Fetch data only if cached data is not present
      onSuccess: (data) => {
        data = data.find(({ id }) => id === appointmentId);
        setFormInitialValues({
          patient: data.patient,
          practitioner: 1,
          appointmentDate: moment(data.startDate),
          startTime: moment(data.startDate),
          status: data.status,
          procedures: data.procedures,
          operatory: data.operatory,
        });
      },
    },
  );

  /**
   * This methods transforms form values and generates the startDateTime object as required by API
   */
  const transformStartDateTime = (formValues) => {
    return moment(
      moment(formValues.appointmentDate)
        .startOf('day')
        .add(
          moment(formValues.startTime).hours() * 60 +
            moment(formValues.startTime).minutes(),
          'minutes',
        ),
    ).format('YYYY-MM-DD HH:mm');
  };

  /**
   * This methods transforms procedures and generates the final array of procedure objects as required by API
   */
  const transformProcedures = (procedures = []) => {
    return procedures.map(({ id: od_procedurecode_id, value: code }) => ({
      od_procedurecode_id,
      code,
    }));
  };

  /**
   * Calculate and return total duration for given set of procedures
   * Returns 0 if no procedure is selected
   */
  const getTotalDurationForSelectedProcedures = (procedures = []) => {
    if (procedures.length) {
      return procedures.reduce((a, b) => ({
        time: a.time + b.time,
      })).time;
    }
    return 0;
  };

  /**
   * Find and return status value by given status id
   * TODO: This is required due to current limitations in the API request object, change this logic once API is fixed
   */
  const getStatusValueById = (statusId) => {
    try {
      return statusDefinitions.data.find(({ id }) => id === statusId).value;
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Handle form submit
   * This method should return transformed form values as a single object to the parent component
   * The parent will take care of further processing of the sent values
   */
  const handleSubmitForm = async (values, { setSubmitting }) => {
    const reqObj = {
      patient_id: values.patient.id,
      practitioner_id: values.practitioner,
      start: transformStartDateTime(values),
      proc_codes: transformProcedures(values.procedures),
      minutes_duration: getTotalDurationForSelectedProcedures(
        values.procedures,
      ),
      operatory_id: values.operatory,
      status: getStatusValueById(values.status),
    };

    // Add id to request object in case of appointment update
    if (appointmentId) reqObj.id = appointmentId;

    setSubmitting(true);
    // Call parent callback method
    const res = await onFormSubmit(reqObj);
    res && setSubmitting(false);
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={formInitialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmitForm}
    >
      {({ isSubmitting }) => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <AutoCompleteInputField
                mt={0}
                fieldName="patient"
                fieldLabel="PATIENT"
                placeholder="Type to search patient"
                getOptionLabel={(item) => item.name}
                onChangeInput={(query) => {
                  setIsLoadingPatients(true);
                  patients.fetchList({
                    search: query,
                    rows: 10,
                  });
                }}
                suggestions={filteredPatients}
                loading={isLoadingPatients}
              />
            </Grid>

            <Grid item xs={6}>
              {practitionerDefinitions.isLoading ? (
                <FormFieldSkeleton />
              ) : (
                <SelectField
                  mt={0}
                  fieldLabel="PROVIDER"
                  fieldName="practitioner"
                  options={practitionerDefinitions.data.map(({ id, abbr }) => (
                    <MenuItem key={id} value={id}>
                      {abbr}
                    </MenuItem>
                  ))}
                />
              )}
            </Grid>

            <Grid item xs={6}>
              <DatePickerField
                disableToolbar
                variant="inline"
                autoOk
                fieldLabel="DATE"
                fieldName="appointmentDate"
                required
                disabled={isSubmitting}
                mt={0}
              />
            </Grid>

            <Grid item xs={6}>
              <TimePickerField
                variant="inline"
                autoOk
                fieldLabel="TIME"
                fieldName="startTime"
                required
                disabled={isSubmitting}
                mt={0}
              />
            </Grid>

            <Grid item xs={12}>
              {procedureDefinitions.isLoading ? (
                <FormFieldSkeleton />
              ) : (
                <TagsInputField
                  fieldLabel="PROCEDURES"
                  fieldName="procedures"
                  onChangeInput={(query) => procedureDefinitions.data}
                  placeholder="Type to search procedure"
                  suggestions={Object.values(procedureDefinitions.data)}
                  suggestionsLimit={100}
                  allowNew={false}
                  required
                />
              )}
            </Grid>

            <Grid item xs={6}>
              {statusDefinitions.isLoading ? (
                <FormFieldSkeleton />
              ) : (
                <SelectField
                  mt={0}
                  fieldLabel="STATUS"
                  fieldName="status"
                  disabled={!appointmentId} // Disable 'STATUS' filed while scheduling a new appointment
                  options={statusDefinitions.data.map(({ id, name }) => (
                    <MenuItem key={id} value={id}>
                      {name}
                    </MenuItem>
                  ))}
                />
              )}
            </Grid>

            <Grid item xs={6}>
              {operatoriesQuery.isLoading ? (
                <FormFieldSkeleton />
              ) : (
                <SelectField
                  mt={0}
                  fieldLabel="OPERATORY"
                  fieldName="operatory"
                  options={operatoriesQuery.data.map(
                    ({ id, text, isHidden }) => (
                      <MenuItem key={id} value={id}>
                        <div
                          style={{ width: '100%' }}
                          className="d-flex justify-content-between"
                        >
                          {text}{' '}
                          {isHidden && (
                            <CustomTooltip
                              placement="right"
                              title="Operatory not visible on scheduler"
                            >
                              <VisibilityOffOutlinedIcon
                                className="ms-1"
                                htmlColor="#c0c0c0"
                                style={{ fontSize: '1rem' }}
                              />
                            </CustomTooltip>
                          )}
                        </div>
                      </MenuItem>
                    ),
                  )}
                />
              )}
            </Grid>
          </Grid>

          <div className="d-flex mt-5">
            <Button
              disabled={isSubmitting}
              variant="outlined"
              color="primary"
              className="primary-btn me-auto"
              onClick={onFormCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              color="secondary"
            >
              {appointmentId
                ? isSubmitting
                  ? `Saving...`
                  : `Save`
                : isSubmitting
                ? `Creating...`
                : `Create`}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default observer(AppointmentForm);

/**
 * Loader component to display while API is fetching data for an individual form field
 */
const FormFieldSkeleton = () => (
  <>
    <Skeleton variant="text" width="40%" height={20} className="mb-1" />
    <Skeleton variant="rect" width="100%" height={38} />
  </>
);
