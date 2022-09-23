import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import { observer } from 'mobx-react';
import { Scrollbars } from 'react-custom-scrollbars';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Task, { TaskSkeleton } from 'components/TaskList/Task';
import ListManager from 'components/ListManager';
import { useStores } from 'hooks/useStores';
import { TASK_STATE } from 'helpers/constants';
import AddOrEditTask, {
  MODE,
} from 'containers/Dashboard/PatientFeed/AddAndEditTaskModal';

const TaskList = () => {
  const { tasks } = useStores();
  const history = useHistory();
  const match = useRouteMatch('/dashboard/tasks');

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  useEffect(() => {
    tasks.detailedTaskInfo = null;
    tasks.currentlySelectedTaskForInfo = null;
    tasks.currentlySelectedTaskCategory = null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const taskLoader = tasks.loaded && tasks.loading ? <LinearProgress /> : null;

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className="d-flex flex-grow-1 align-items-center"></div>
      </div>
      <div className={styles.subHeaderContainer}>
        <div
          className={styles.addTaskButton}
          onClick={() => setShowAddTaskModal(true)}
        >
          + Add Task
        </div>
      </div>
      <Scrollbars renderTrackHorizontal={(props) => <div {...props} />}>
        <div className={styles.tasksContainer}>
          {/* To do section */}
          <div className={styles.subHeaderText}>
            To do (
            {tasks.currentlySelectedTaskCategory
              ? tasks.getTasksByStatusAndCategory({
                  state: TASK_STATE.todo,
                  categoryId: tasks.currentlySelectedTaskCategory.id,
                }).length
              : tasks.getTasksByStatus({
                  state: TASK_STATE.todo,
                }).length}
            )
          </div>

          {taskLoader}

          {tasks.currentlySelectedTaskCategory ? (
            <ListManager
              loading={tasks.loading}
              loaded={tasks.loaded}
              data={tasks.getTasksByStatusAndCategory({
                state: TASK_STATE.todo,
                categoryId: tasks.currentlySelectedTaskCategory.id,
              })}
              render={React.memo(Task)}
              customFunc={false}
              renderLoading={<TaskSkeleton />}
            />
          ) : (
            <ListManager
              loading={tasks.loading}
              loaded={tasks.loaded}
              data={tasks.getTasksByStatus({
                state: TASK_STATE.todo,
              })}
              render={React.memo(Task)}
              customFunc={false}
              renderLoading={<TaskSkeleton />}
            />
          )}

          {/* Overdue section */}
          <div className={styles.subHeaderText}>
            Overdue (
            {tasks.currentlySelectedTaskCategory
              ? tasks.getTasksByStatusAndCategory({
                  state: TASK_STATE.overdue,
                  categoryId: tasks.currentlySelectedTaskCategory.id,
                }).length
              : tasks.getTasksByStatus({
                  state: TASK_STATE.overdue,
                }).length}
            )
          </div>

          {taskLoader}

          {tasks.currentlySelectedTaskCategory ? (
            <ListManager
              loading={tasks.loading}
              loaded={tasks.loaded}
              data={tasks.getTasksByStatusAndCategory({
                state: TASK_STATE.overdue,
                categoryId: tasks.currentlySelectedTaskCategory.id,
              })}
              render={React.memo(Task)}
              customFunc={false}
              renderLoading={<TaskSkeleton />}
            />
          ) : (
            <ListManager
              loading={tasks.loading}
              loaded={tasks.loaded}
              data={tasks.getTasksByStatus({
                state: TASK_STATE.overdue,
              })}
              render={React.memo(Task)}
              customFunc={false}
              renderLoading={<TaskSkeleton />}
            />
          )}

          {/* Completed section */}
          <div className={styles.subHeaderText}>
            Completed (
            {tasks.currentlySelectedTaskCategory
              ? tasks.getTasksByStatusAndCategory({
                  state: TASK_STATE.completed,
                  categoryId: tasks.currentlySelectedTaskCategory.id,
                }).length
              : tasks.getTasksByStatus({
                  state: TASK_STATE.completed,
                }).length}
            )
          </div>

          {taskLoader}

          {tasks.currentlySelectedTaskCategory ? (
            <ListManager
              loading={tasks.loading}
              loaded={tasks.loaded}
              data={tasks.getTasksByStatusAndCategory({
                state: TASK_STATE.completed,
                categoryId: tasks.currentlySelectedTaskCategory.id,
              })}
              render={React.memo(Task)}
              customFunc={false}
              renderLoading={<TaskSkeleton />}
            />
          ) : (
            <ListManager
              loading={tasks.loading}
              loaded={tasks.loaded}
              data={tasks.getTasksByStatus({
                state: TASK_STATE.completed,
              })}
              render={React.memo(Task)}
              customFunc={false}
              renderLoading={<TaskSkeleton />}
            />
          )}
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
};

export default observer(TaskList);
