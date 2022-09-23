import React, { useState, useRef, useMemo } from 'react';
import { useStores } from 'hooks/useStores';
import { useQueryClient, useMutation } from 'react-query';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import CalendarIcon from '@material-ui/icons/CalendarToday';
import ScheduleIcon from '@material-ui/icons/Schedule';
import Button from '@material-ui/core/Button';
import StatusMenu from '../StatusMenu';
import { default as StatusIcon } from '@material-ui/icons/FiberManualRecord';
import CustomAppointmentForm from './CustomAppointmentForm';
import LinearProgress from '@material-ui/core/LinearProgress';
import { FEATURES } from 'helpers/constants';

const useStyles = makeStyles((theme) => ({
  popper: {
    zIndex: 2,
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
      },
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
      },
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${theme.palette.background.paper}`,
      },
    },
  },
  arrow: {
    position: 'absolute',
    fontSize: 7,
    width: '3em',
    height: '3em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
  },
  fieldContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    color: '#999999',
  },
  fieldValue: {
    fontSize: '1.14rem',
    color: '#02122F',
    fontWeight: 500,
  },
}));

const CustomTooltip = (props) => {
  const queryClient = useQueryClient();
  const { scheduling: schedulingStore, notification } = useStores();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [arrowRef, setArrowRef] = useState(null);
  const classes = useStyles();
  const { data: appointmentData } = props;
  const [openForm, setOpenForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const statusTypes = useMemo(
    () =>
      queryClient
        .getQueryData('statusDefinitions')
        .map(({ id, name, value, config: { primaryColor: color } }) => {
          return {
            id,
            label: name,
            value,
            icon: <StatusIcon style={{ color: color }} />,
          };
        }),
    [queryClient.getQueryData('statusDefinitions')], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const appointmentMutation = useMutation(
    (reqObj) => schedulingStore.updateAppointment(reqObj),
    {
      onSuccess: () => {
        // TODO: 5 seconds of timeout is added due async limitation in create/update appointment API
        // Remove this time out once the create/update appointment API is fixed.
        setTimeout(() => {
          notification.showSuccess('Appointment status updated successfully');
          queryClient.invalidateQueries(['officeAppointments']);
          queryClient.invalidateQueries([
            'patientAppointments',
            schedulingStore.selectedPatientId,
          ]);
        }, 5000);
      },
      onError: (errorMessage) => {
        setOpen(false);
        notification.showError(errorMessage);
      },
      onSettled: () => {
        setSubmitting(false);
      },
    },
  );

  const handleClose = (event) => {
    event.stopPropagation();
    if (ref.current && ref.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleStatusChange = (value) => {
    setSubmitting(true);
    // TODO: Remove this info message once the create/update appointment API is fixed.
    notification.showInfo(
      <div>
        <div className="mb-2">Updating appointment...</div>
        <LinearProgress color="primary" />
      </div>,
    );

    appointmentMutation.mutate({
      id: appointmentData.id,
      status: value,
    });
  };

  return (
    <div
      className="h-100"
      ref={ref}
      onMouseEnter={(e) => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {props.children}
      <Popper
        open={open}
        anchorEl={ref.current}
        role={undefined}
        className={classes.popper}
        placement="right"
        disablePortal={false}
        modifiers={{
          flip: {
            enabled: true,
          },
          preventOverflow: {
            enabled: true,
            boundariesElement: 'scrollParent',
          },
          arrow: {
            enabled: true,
            element: arrowRef,
          },
        }}
      >
        <span className={classes.arrow} ref={setArrowRef} />
        <Paper elevation={4}>
          <ClickAwayListener onClickAway={handleClose}>
            <div
              style={{ maxHeight: 400, width: 300 }}
              className="d-flex flex-column"
            >
              <LinearProgress
                color="secondary"
                className={`${submitting ? 'visible' : 'invisible'}`}
              />
              <div className="p-3 m-1 overflow-auto">
                <div className={classes.fieldContainer}>
                  <CalendarIcon className="me-2" fontSize="small" />
                  <span className={classes.fieldValue}>
                    {moment(appointmentData.startDate).format('M/D/YYYY')}
                  </span>
                </div>
                <div className={`mt-3 ${classes.fieldContainer}`}>
                  <ScheduleIcon className="me-2" fontSize="small" />
                  <span className={classes.fieldValue}>
                    {moment(appointmentData.startDate).format('h:mm a')} -{' '}
                    {moment(appointmentData.endDate).format('h:mm a')}
                  </span>
                </div>
                <div className="mt-3">
                  <StatusMenu
                    disabled={!FEATURES.SCHEDULE_APPOINTMENT}
                    value={statusTypes.find(
                      (status) => status.id === appointmentData.status,
                    )}
                    onChangeValue={(value) => handleStatusChange(value)}
                    menuItems={statusTypes}
                  />
                </div>
                <div className="mt-3">
                  <div className={classes.fieldLabel}>Patient</div>
                  <div className={classes.fieldValue}>
                    {appointmentData.patient.name
                      ? appointmentData.patient.name
                      : '-'}
                  </div>
                </div>
                <div className="mt-3">
                  <div className={classes.fieldLabel}>Provider</div>
                  <div className={classes.fieldValue}>
                    {appointmentData.provider ? appointmentData.provider : '-'}
                  </div>
                </div>
                {/* <div className="mt-3">
                  <div className={classes.fieldLabel}>Units</div>
                  <div className={classes.fieldValue}>
                    {appointmentData.units ? appointmentData.units : '-'}
                  </div>
                </div>
                <div className="mt-3">
                  <div className={classes.fieldLabel}>Insurance</div>
                  <div className={classes.fieldValue}>
                    {appointmentData.insurance
                      ? appointmentData.insurance
                      : '-'}
                  </div>
                </div> */}
                <div className="mt-3">
                  <div className={classes.fieldLabel}>Procedures</div>
                  <div className={classes.fieldValue}>
                    {!!appointmentData.procedures &&
                    appointmentData.procedures.length
                      ? appointmentData.procedures
                          .map(({ name }) => name)
                          .join(', ')
                      : 'NA'}
                  </div>
                </div>
                {/* <div className="mt-3">
                  <div className={classes.fieldLabel}>Code</div>
                  <div className={classes.fieldValue}>
                    {appointmentData.code ? appointmentData.code : '-'}
                  </div>
                </div>
                <div className="mt-3">
                  <div className={classes.fieldLabel}>Site</div>
                  <div className={classes.fieldValue}>
                    {appointmentData.site ? appointmentData.site : '-'}
                  </div>
                </div> */}
              </div>
              <div>
                <div className="d-flex border-top py-2">
                  {/* <div className="flex-grow-1 text-center">
                    <div className={classes.fieldLabel}>COPAY</div>
                    <div className={classes.fieldValue}>
                      {appointmentData.copay ? appointmentData.copay : '-'}
                    </div>
                  </div> */}
                  <div className="flex-grow-1 text-center">
                    <div className={classes.fieldLabel}>TOTAL</div>
                    <div className={classes.fieldValue}>
                      {appointmentData.total
                        ? `$${appointmentData.total}`
                        : '-'}
                    </div>
                  </div>
                </div>
                {FEATURES.SCHEDULE_APPOINTMENT && (
                  <div className="d-flex border-top">
                    {/* <div className="flex-grow-1 border-right">
                    <Button color="default" fullWidth onClick={handleClose}>
                      Delete
                    </Button>
                  </div> */}
                    <div className="flex-grow-1">
                      <Button
                        color="secondary"
                        fullWidth
                        onClick={() => setOpenForm(true)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ClickAwayListener>
        </Paper>
      </Popper>

      <CustomAppointmentForm
        appointmentId={appointmentData.id}
        open={openForm}
        onClose={() => setOpenForm(false)}
      />
    </div>
  );
};

export default CustomTooltip;
