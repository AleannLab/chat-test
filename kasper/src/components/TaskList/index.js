import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import { Scrollbars } from 'react-custom-scrollbars';
// import { ReactComponent as SortIcon } from "assets/images/sort-icon.svg";
// import { ReactComponent as FilterIcon } from "assets/images/filter-icon.svg";
import Task, { TaskSkeleton } from './Task';
import { useStores } from 'hooks/useStores';
import ListManager from 'components/ListManager';
import { observer } from 'mobx-react';
import { useRouteMatch, Link } from 'react-router-dom';
import { LinearProgress } from '@material-ui/core';
import { TASK_STATE } from 'helpers/constants';
import AddOrEditTask, {
  MODE,
} from 'containers/Dashboard/PatientFeed/AddAndEditTaskModal';

const TaskList = observer(() => {
  const { tasks, authentication } = useStores();
  const match = useRouteMatch('/dashboard/office-task');

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  useEffect(() => {
    tasks.fetchList({
      withCategories: true,
      assignedTo: authentication.user.id,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const taskLoader = tasks.loaded && tasks.loading ? <LinearProgress /> : null;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className="d-flex flex-grow-1 pb-3">
          <div className="me-auto">My Tasks</div>
        </div>
        <div className={styles.addTaskInputboxContainer}>
          <div
            className={styles.addTaskButton}
            onClick={() => setShowAddTaskModal(true)}
          >
            + Add Task
          </div>
        </div>
      </div>
      <Scrollbars renderTrackHorizontal={(props) => <div {...props} />}>
        <div style={{ padding: '0rem 1.4rem' }}>
          <div className="mb-3">
            {/* Todo section */}
            <div className={styles.sectionHeader}>
              To do (
              {
                tasks.getTasksByStatusAndAssignee({
                  state: TASK_STATE.todo,
                  assignee: authentication.user.id,
                }).length
              }
              )
            </div>
            {taskLoader}
            <ListManager
              loading={tasks.loading}
              loaded={tasks.loaded}
              data={tasks.getTasksByStatusAndAssignee({
                state: TASK_STATE.todo,
                assignee: authentication.user.id,
              })}
              render={React.memo(Task)}
              renderLoading={<TaskSkeleton />}
            />
          </div>

          {/* Overdue section */}
          <div className={styles.sectionHeader}>
            Overdue (
            {
              tasks.getTasksByStatusAndAssignee({
                state: TASK_STATE.overdue,
                assignee: authentication.user.id,
              }).length
            }
            )
          </div>
          {taskLoader}
          <ListManager
            loading={tasks.loading}
            loaded={tasks.loaded}
            data={tasks.getTasksByStatusAndAssignee({
              state: TASK_STATE.overdue,
              assignee: authentication.user.id,
            })}
            render={React.memo(Task)}
            renderLoading={<TaskSkeleton />}
          />

          {/* Completed section */}
          <div>
            <div className={styles.sectionHeader}>
              Completed (
              {
                tasks.getTasksByStatusAndAssignee({
                  state: TASK_STATE.completed,
                  assignee: authentication.user.id,
                }).length
              }
              )
            </div>
            {taskLoader}
            <ListManager
              loading={tasks.loading}
              loaded={tasks.loaded}
              data={tasks.getTasksByStatusAndAssignee({
                state: TASK_STATE.completed,
                assignee: authentication.user.id,
              })}
              render={React.memo(Task)}
              renderLoading={<TaskSkeleton />}
            />
          </div>
        </div>
      </Scrollbars>
      {showAddTaskModal && (
        <AddOrEditTask
          view={MODE.ADD}
          onClose={() => setShowAddTaskModal(false)}
        />
      )}
    </div>
  );
});

export default TaskList;
