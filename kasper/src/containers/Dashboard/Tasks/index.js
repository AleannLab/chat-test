import React, { useEffect } from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import { Route } from 'react-router-dom';

import AddTask from 'containers/Dashboard/PatientFeed/AddTask';
import TaskCategories from './TaskCategories';
import TaskList from './TaskList';
import { useStores } from 'hooks/useStores';
// import TaskInfo from "./TaskInfo";
import HeadComp from 'components/SEO/HelmetComp';

const Tasks = () => {
  const { tasks } = useStores();

  useEffect(() => {
    tasks.fetchList({ withCategories: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <HeadComp title="Tasks" />
      <Grid container className={styles.root} wrap="nowrap">
        <Grid item xs={6} md={4} className={styles.taskCategoriesContainer}>
          <TaskCategories />
        </Grid>
        <Grid item xs={6} md={8} className={styles.taskListContainer}>
          <TaskList />
        </Grid>
        {/* <Grid item xs={6} md={6} className={styles.taskInfoContainer}> */}
        {/* <TaskInfo /> */}
        {/* </Grid> */}
      </Grid>
      <Route path={`/dashboard/tasks/add-task`} component={AddTask} />
      <Route path={`/dashboard/tasks/edit-task`} component={AddTask} />
    </>
  );
};

export default Tasks;
