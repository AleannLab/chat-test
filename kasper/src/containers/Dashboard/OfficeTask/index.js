import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import IntraOfficeChat from 'components/IntraOfficeChat';
import PatientBoard from 'components/PatientBoard';
import TaskList from 'components/TaskList';
import { Route } from 'react-router-dom';
import AddTask from 'containers/Dashboard/PatientFeed/AddTask';
import { useStores } from 'hooks/useStores';
import AddPatient from 'components/PatientBoard/AddPatient';
import AnalyticsDrawer from 'components/AnalyticsDrawer';
import { PERMISSION_IDS } from 'helpers/constants';
import HeadComp from 'components/SEO/HelmetComp';
export default function Content() {
  const [morningHuddleStatus, setMorningHuddleStatus] = useState(false);

  const { tasks, permissions, authentication } = useStores();
  useEffect(() => {
    const user_id = authentication.user.id;
    const isUserAllowedForAnalytics = async (user_id) => {
      const huddlePermissionStatus = await permissions.getUserPermissions(
        user_id,
      );
      if (typeof huddlePermissionStatus[0] == 'undefined') {
        return false;
      } else if (
        huddlePermissionStatus.find(
          (permission) =>
            permission.permission_id == PERMISSION_IDS.MORNING_HUDDLE &&
            permission.enabled == 1,
        )
      ) {
        setMorningHuddleStatus(true);
      }
    };
    isUserAllowedForAnalytics(user_id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    tasks.currentlySelectedTaskForInfo = null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <HeadComp title="Dashboard" />
      <Grid
        container
        className={styles.root}
        wrap="nowrap"
        id="kasper-dashboard"
        style={{ position: 'relative' }}
      >
        <Grid item xs={12} sm={3} className={styles.taskListContainer}>
          <TaskList />
        </Grid>
        <Grid item xs={12} sm={9} className="d-flex flex-column">
          <div className={styles.patientBoardContainer}>
            <PatientBoard />
          </div>
          <div className={styles.chatBoxContainer}>
            <IntraOfficeChat />
          </div>
        </Grid>
        {morningHuddleStatus && <AnalyticsDrawer />}
      </Grid>
      <Route exact path="/dashboard/office-task/add-task" component={AddTask} />
      <Route
        exact
        path="/dashboard/office-task/edit-task"
        component={AddTask}
      />
      <Route
        exact
        path="/dashboard/office-task/add-patient"
        component={AddPatient}
      />
    </>
  );
}
