import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Button, withStyles } from '@material-ui/core';
import TabHeader from '../TabHeader';
import styles from './index.module.css';
import NoDataAvailable from '../NoDataAvailable';
import { useStores } from 'hooks/useStores';
import { useMutation, useQueryClient } from 'react-query';
import AddEditTask from './AddEditTask';
import TaskItem from './TaskItem';

const StyledButton = withStyles(() => ({
  root: {
    padding: 0,
  },
}))(Button);

const Tasks = ({ tasks: taskList, patient, activeUsers }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { tasks, users, notification } = useStores();
  const taskRef = useRef(null);
  const queryClient = useQueryClient();

  const { mutateAsync: markTaskAsComplete } = useMutation(
    'updateTaskMutation',
    (task) => tasks.markTaskAsComplete(task),
    {
      onSuccess: ({ data }) =>
        queryClient.setQueryData(['patientTasks', patient?.id], (oldData) => {
          return oldData.map((o) => (o.id !== data.id ? o : data));
        }),
    },
  );

  const { mutateAsync: deleteTask } = useMutation(
    'deleteTaskMutation',
    (taskId) => tasks.deleteTaskQuery(taskId),
    {
      onSuccess: (data, taskId) => {
        notification.showSuccess('Task deleted successfully!');
        queryClient.setQueryData(['patientTasks', patient?.id], (oldData) => {
          return oldData.filter((o) => o.id !== taskId);
        });
        setTimeout(() => {
          notification.hideNotification();
        }, 3000);
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const sortedTaskList = useMemo(() => {
    if (!taskList.length) return [];
    return taskList
      .slice()
      .sort((a, b) =>
        a.completed === b.completed ? 0 : !a.completed ? -1 : 1,
      );
  }, [taskList]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <TabHeader title="Patient Tasks">
        <StyledButton
          color="secondary"
          onClick={() => {
            taskRef.current = null;
            setShowTaskModal(true);
          }}
        >
          + Add New
        </StyledButton>
      </TabHeader>
      <Box marginY={2} className={styles.tasksContainer}>
        {sortedTaskList.length === 0 ? (
          <NoDataAvailable message="No tasks here." />
        ) : (
          sortedTaskList.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={() =>
                markTaskAsComplete({
                  task_id: task.id,
                  completed: true,
                })
              }
              onDelete={() => {
                notification.showInfo('Deleting task...');
                deleteTask(task.id);
              }}
              onEdit={() => {
                taskRef.current = task;
                setShowTaskModal(true);
              }}
            ></TaskItem>
          ))
        )}
      </Box>

      {showTaskModal && (
        <AddEditTask
          onClose={() => {
            setShowTaskModal(false);
          }}
          activeUsers={activeUsers}
          afterAddOrEdit={() =>
            queryClient.refetchQueries(['patientTasks', patient?.id])
          }
          task={taskRef.current}
          patientInContext={patient}
        />
      )}
    </Box>
  );
};

export default Tasks;
