import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';
import { useQuery, useQueryClient } from 'react-query';
import debounce from 'lodash.debounce';
import Loader from 'components/Core/Loader';
import Paper from '@material-ui/core/Paper';
import {
  ViewState,
  GroupingState,
  IntegratedGrouping,
  // IntegratedEditing,
  // EditingState
} from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  Resources,
  Appointments,
  GroupingPanel,
  DayView,
  // DragDropProvider,
  CurrentTimeIndicator,
  Toolbar,
  DateNavigator,
} from '@devexpress/dx-react-scheduler-material-ui';
import CustomDayScaleRow from './CustomComponents/CustomDayScaleRow';
import CustomGroupingPanelCell from './CustomComponents/CustomGroupingPanelCell';
import CustomDateNavigator from './CustomComponents/CustomDateNavigator';
import CustomAppointment from './CustomComponents/CustomAppointment';
import CustomToolbar from './CustomComponents/CustomToolbar';
import CustomDayViewLayout from './CustomComponents/CustomDayViewLayout';
import Grid from '@material-ui/core/Grid';
import InfoPanel from './InfoPanel';
import moment from 'moment';
import LinearProgress from '@material-ui/core/LinearProgress';
import HeadComp from 'components/SEO/HelmetComp';

const RESOURCE_NAME = 'operatory';
const OFFICE_START_TIME = '7'; // 24 hours format - 'H'

const grouping = [
  {
    resourceName: RESOURCE_NAME,
  },
];

const TimeIndicator = ({ top, ...restProps }) => (
  <div top={top} {...restProps}>
    <div className={styles.nowIndicator} />
  </div>
);

const Scheduling = () => {
  const { scheduling: schedulingStore, patientsFeed } = useStores();
  const [resources, setResources] = useState();
  const [appointmentsData, setAppointmentsData] = useState([]);
  const defaultVisibleTableRowRef = useRef(null);
  const [firstAppointmentTime, setFirstAppointmentTime] =
    useState(OFFICE_START_TIME);

  // react-query for appointment status definitions
  const statusDefinitions = useQuery('statusDefinitions', () =>
    schedulingStore.getStatusDefinitions(),
  );

  const queryClient = useQueryClient();

  const generateResources = (operatories) => {
    let resourceInstances = [
      ...operatories.filter(({ id }) =>
        schedulingStore.visibleOperatories.includes(id),
      ),
    ];
    resourceInstances = resourceInstances.length
      ? resourceInstances
      : [{ id: -1 }];
    setResources([
      {
        fieldName: RESOURCE_NAME,
        title: 'Operatory',
        instances: resourceInstances,
        allowMultiple: false,
      },
    ]);
  };

  // Performance : Get operatories from cache and show the timetable view right away instead on showing gif loader
  useEffect(() => {
    const operatories = queryClient.getQueryData('operatories');
    if (operatories) {
      generateResources(operatories);
    }
  }, [queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (defaultVisibleTableRowRef?.current) {
      defaultVisibleTableRowRef.current.scrollIntoView({ block: 'start' });
    }
  }, [firstAppointmentTime, defaultVisibleTableRowRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const appointmentCount = appointmentsData.length;
    if (appointmentCount > 0) {
      setFirstAppointmentTime(
        moment(appointmentsData[appointmentCount - 1].startDate).format('H'),
      );
    } else {
      setFirstAppointmentTime(OFFICE_START_TIME);
    }
  }, [appointmentsData]);

  // react-query for operatories
  useQuery('operatories', () => schedulingStore.getOperatories(), {
    enabled: !!statusDefinitions.isSuccess,
    onSuccess: (data) => {
      generateResources(data);

      // Refetch appointments
      officeAppointmentQuery.refetch();
    },
  });

  // react-query for office appointments
  const officeAppointmentQuery = useQuery(
    ['officeAppointments', schedulingStore.currentDate],
    () => schedulingStore.getAppointments(schedulingStore.currentDate),
    {
      enabled: !!schedulingStore.currentDate,
      keepPreviousData: true,
      onSuccess: (data) => {
        setAppointmentsData([...data]);
      },
    },
  );

  // Handle date navigation change event
  const handleDateChange = debounce((newDate) => {
    schedulingStore.setCurrentDate(newDate);
    schedulingStore.setSelectedPatientId(null);
    patientsFeed.setSelectedPatient(null);
  }, 500);

  // NOSONAR
  // const commitChanges = ({ added, changed, deleted }) => {
  //     if (added) {
  //         const startingAddedId = appointmentsData.length > 0 ? appointmentsData[appointmentsData.length - 1].id + 1 : 0;
  //         setAppointmentsData([...appointmentsData, { id: startingAddedId, ...added }]);
  //     }
  //     if (changed) {
  //         setAppointmentsData(
  //             appointmentsData.map(appointment => (
  //                 changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment))
  //         );
  //     }
  //     if (deleted !== undefined) {
  //         setAppointmentsData(appointmentsData.filter(appointment => appointment.id !== deleted));
  //     }
  // };

  return (
    <>
      <HeadComp title="Calendar" />
      <div className={styles.root}>
        <Loader show={!resources} message="Loading appointments...">
          <Grid container className={styles.root} wrap="nowrap">
            <Grid item xs={8}>
              <Paper className={styles.container}>
                <LinearProgress
                  color="secondary"
                  className={`${styles.schedulerProgressBar} ${
                    officeAppointmentQuery.isFetching ? 'visible' : 'invisible'
                  }`}
                />
                <Scheduler data={appointmentsData}>
                  <ViewState
                    defaultCurrentDate={schedulingStore.currentDate}
                    onCurrentDateChange={(date) => handleDateChange(date)}
                  />

                  {/* <EditingState
                                    onCommitChanges={commitChanges}
                                /> */}

                  <GroupingState grouping={grouping} />

                  <DayView
                    startDayHour={0}
                    cellDuration={60}
                    endDayHour={24}
                    dayScaleRowComponent={CustomDayScaleRow}
                    layoutComponent={CustomDayViewLayout}
                    timeTableRowComponent={(props) => {
                      return !!firstAppointmentTime &&
                        moment(props.children[0].props.startDate)
                          .add(60, 'minute')
                          .format('H') === firstAppointmentTime ? (
                        <tr ref={defaultVisibleTableRowRef}>
                          {props.children}
                        </tr>
                      ) : (
                        <DayView.TimeTableRow {...props}></DayView.TimeTableRow>
                      );
                    }}
                  />

                  <Appointments appointmentComponent={CustomAppointment} />

                  <CurrentTimeIndicator indicatorComponent={TimeIndicator} />

                  <Resources
                    data={resources}
                    mainResourceName={RESOURCE_NAME}
                  />

                  <IntegratedGrouping />
                  {/* <IntegratedEditing /> */}

                  {/* <DragDropProvider draftAppointmentComponent={CustomAppointment} sourceAppointmentComponent={() => <></>} /> */}
                  <GroupingPanel cellComponent={CustomGroupingPanelCell} />

                  <Toolbar rootComponent={CustomToolbar} />

                  <DateNavigator rootComponent={CustomDateNavigator} />
                </Scheduler>
              </Paper>
            </Grid>

            <Grid item xs={4}>
              <InfoPanel />
            </Grid>
          </Grid>
        </Loader>
      </div>
    </>
  );
};

export default observer(Scheduling);
