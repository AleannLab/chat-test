import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Tabs, Tab, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ReactComponent as UserProfile } from 'assets/images/user-profile.svg';
import { ReactComponent as PatientFormIcon } from 'assets/images/form.svg';
import { ReactComponent as PatientTasksIcon } from 'assets/images/tasks.svg';
import CircularProgress from '@material-ui/core/CircularProgress';

import { useQuery } from 'react-query';
import { useStores } from 'hooks/useStores';
import ProfileTab from './Profile';
import PatientForms from './Forms/PatientForms';
import TasksTab from './Tasks';
import styles from './index.module.css';
import CustomTooltip from 'components/Core/Tooltip';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    height: '100%',
  },
  tab: {
    width: '50px',
    minWidth: '50px',
    maxWidth: '50px',
  },
  tabs: {
    backgroundColor: '#F0F3F8',
    flex: '0 0 50px',
  },
  infoMessage: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: '#354159',
    fontFamily: 'Montserrat',
    color: '#F2F2F2',
    fontSize: '1.43rem',
    opacity: 0.9,
    padding: '2rem',
    zIndex: 10,
  },
}));

const CounterNotification = ({ count, loading }) => {
  return (
    <div
      className={styles.counterNotification}
      style={{
        backgroundColor: !loading && count ? '#F4266E' : 'transparent',
        left: !loading && count ? 10 : 8,
        border: `0.4 px solid ${!loading && count ? '#f0f3f8' : 'transparent'}`,
      }}
    >
      {!loading ? (
        count || null
      ) : (
        <CircularProgress style={{ height: 9, width: 9 }} />
      )}
    </div>
  );
};

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      style={{ width: 'calc(100% - 50px)', height: '100%' }}
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3} height="100%">
          {children}
        </Box>
      )}
    </div>
  );
};

const PatientPanel = ({ emptyMsg }) => {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const { patientsFeed, notification, patientForm, tasks, users } = useStores();
  const selectedPatient = patientsFeed.selectedPatient;

  const { data: activeUsers = [] } = useQuery(['fetchActiveUsers'], () =>
    users.fetchActiveUsersQuery(),
  );

  const { data: patientTasks = [], isFetching: isPatientTasksFetching } =
    useQuery(
      ['patientTasks', selectedPatient?.id],
      () => tasks.getTasksByPatientId(selectedPatient.id),
      {
        enabled: !!selectedPatient?.id,
        onSuccess: (response) => {
          return response;
        },
      },
    );

  const { data: patientForms, isFetching: isPatientFormsFetching } = useQuery(
    ['patientForms', selectedPatient && selectedPatient.id],
    () => patientForm.fetchPatientForms(selectedPatient.id),
    {
      enabled:
        selectedPatient !== null && Object.keys(selectedPatient).length > 0,
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the forms',
        );
      },
    },
  );

  const incompletFormsCount = useMemo(() => {
    if (!patientForms) {
      return 0;
    }
    return patientForms.incomplete_forms.length || 0;
  }, [patientForms]);

  const incompleteTasksCount = useMemo(() => {
    if (!patientTasks) {
      return 0;
    }
    return patientTasks.filter((task) => !task.completed).length;
  }, [patientTasks]);

  return (
    <Box display="flex" className={styles.container}>
      {(!selectedPatient ||
        selectedPatient.is_patient === 0 ||
        patientsFeed.isNewSMS) && (
        <div className={styles.infoMessage}>
          {emptyMsg || 'Patient not added to Open Dental'}
        </div>
      )}
      <Tabs
        classes={{ root: styles.tabs }}
        orientation="vertical"
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
      >
        <Tab
          className={styles.tab}
          label={
            <CustomTooltip
              color="#F0F3F8"
              placement="right"
              textColor="#02122F"
              title="Profile"
            >
              <UserProfile fill={activeTab === 0 ? '#F4266E' : '#9A9A9A'} />
            </CustomTooltip>
          }
        />
        <Tab
          className={styles.tab}
          label={
            <CustomTooltip
              color="#F0F3F8"
              placement="right"
              textColor="#02122F"
              title="Forms"
            >
              <div style={{ position: 'relative' }}>
                <CounterNotification
                  loading={isPatientFormsFetching}
                  count={incompletFormsCount}
                />
                <PatientFormIcon
                  fill={activeTab === 1 ? '#F4266E' : '#9A9A9A'}
                />
              </div>
            </CustomTooltip>
          }
        />
        <Tab
          className={styles.tab}
          label={
            <CustomTooltip
              color="#F0F3F8"
              placement="right"
              textColor="#02122F"
              title="Tasks"
            >
              <div style={{ position: 'relative' }}>
                <CounterNotification
                  loading={isPatientTasksFetching}
                  count={incompleteTasksCount}
                />
                <PatientTasksIcon
                  fill={activeTab === 2 ? '#F4266E' : '#9A9A9A'}
                />
              </div>
            </CustomTooltip>
          }
        />
      </Tabs>
      <TabPanel value={activeTab} index={0}>
        <ProfileTab patient={selectedPatient || {}} />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <PatientForms forms={patientForms} />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <TasksTab
          tasks={patientTasks}
          patient={selectedPatient || {}}
          activeUsers={activeUsers}
        />
      </TabPanel>
    </Box>
  );
};

export default observer(PatientPanel);
