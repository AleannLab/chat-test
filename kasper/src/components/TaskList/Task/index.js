import React, { useMemo, useState } from 'react';
import styles from './index.module.css';
import Checkbox from 'components/Core/Checkbox';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { observer } from 'mobx-react';
import { useStores } from 'hooks/useStores';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { useHistory, useLocation } from 'react-router-dom';
import Skeleton from '@material-ui/lab/Skeleton';
import moment from 'moment';
import AddOrEditTask, {
  MODE,
} from 'containers/Dashboard/PatientFeed/AddAndEditTaskModal';

const Task = observer((props) => {
  const { tasks, users, authentication } = useStores();
  const history = useHistory();
  const taskData = tasks.get([{ categories: [] }, props.id]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const location = useLocation();

  const [showEditTaskDialog, setShowEditTaskDialog] = useState();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const selectForDetailedInfo = () => {
    // if (props.customFunc) {
    tasks.detailedTaskInfo = taskData;
    tasks.currentlySelectedTaskForInfo = props.id;
    // }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isOverdue = (task) => {
    return !task.completed && tasks.isOverdue(task.due_date);
  };

  const editControl = useMemo(() => {
    return (
      authentication.user.account_type === 'Admin' ||
      taskData.created_by === authentication.user.id ||
      taskData.assigned_to_id === authentication.user.id
    );
  }, [authentication, taskData]);

  return (
    <div
      className={
        tasks.currentlySelectedTaskForInfo === props.id
          ? styles.selectedRoot
          : styles.root
      }
      onClick={props.customFunc ? selectForDetailedInfo : null}
    >
      <div className={styles.headSection}>
        <div
          className={`${styles.greyedText} mb-2 d-flex justify-content-between align-items-center`}
        >
          <div>
            {taskData.patient?.firstname} {taskData.patient?.lastname}
          </div>
          <div className={`${styles.menuIconBox}`}>
            {authentication.user.account_type === 'Admin' ||
            taskData.created_by === authentication.user.id ? (
              <MoreHorizIcon
                className={styles.menuIcon}
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
              />
            ) : null}
          </div>
        </div>
        <div className={styles.checkBoxContainer}>
          <Checkbox
            className={styles.checkBox}
            style={{
              opacity: taskData.completed,
              cursor: editControl ? '' : 'not-allowed',
            }}
            checked={!!taskData.completed}
            disableRipple
            onChange={(e) => {
              editControl &&
                tasks.taskStatus({
                  task_id: props.id,
                  completed: taskData.completed ? 0 : 1,
                });
            }}
          />
          <div
            className={`${styles.taskLabel} ${
              !!taskData.completed && styles.taskCompletedLabel
            }`}
          >
            {taskData.task_name}
          </div>
        </div>
        <div className={styles.taskSubLabel}>
          {authentication.user.id !== taskData.assigned_to_id ? (
            <span className={styles.highlightedText}>
              @
              {taskData.assigned_to_id
                ? users.getUserById(taskData.assigned_to_id)?.username
                : 'Unknown'}{' '}
            </span>
          ) : null}
          <span className={styles.greyedText}>
            assigned on {moment(taskData.created_at).format('MMMM D')}{' '}
          </span>
          <span className={styles.highlightedText}>
            {users.getUserById(taskData.created_by)
              ? `by ${users.getUserById(taskData.created_by)?.username}`
              : null}
          </span>
        </div>
      </div>

      <div className={styles.subInfoContainer}>
        <div className={styles.highlightedText}>
          {taskData.categories.map((category) => '#' + category.name).join(' ')}
        </div>
        <div className="d-flex">
          <div
            className={`${styles.taskDate} ${
              !!taskData.completed && styles.taskCompletedDate
            } ${isOverdue(taskData) ? styles.overdue : ''}`}
          >
            <CalendarTodayIcon className={styles.dateIcon} />
            <span>{moment.utc(taskData.due_date).format('MMMM DD, YYYY')}</span>
          </div>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={() => {
                setShowEditTaskDialog(true);
                handleClose();
              }}
            >
              Edit Task
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                tasks.deleteTask({ task_id: props.id });
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </div>
      </div>
      {showEditTaskDialog && (
        <AddOrEditTask
          view={MODE.EDIT}
          task_id={props.id}
          onClose={() => setShowEditTaskDialog(false)}
        />
      )}
    </div>
  );
});

export const TaskSkeleton = () => (
  <div className={styles.root}>
    <div className={styles.headSection}>
      <div className={styles.checkBoxContainer}>
        <Skeleton variant="rect" width={20} height={15} />
        <Skeleton className="ms-3" variant="rect" width="60%" height={15} />
      </div>
      <br />
      <div className={styles.taskSubLabel}>
        <Skeleton variant="rect" width="95%" height={15} />
      </div>
    </div>

    <div className={styles.subInfoContainer}>
      <div className={styles.highlightedText}>
        <Skeleton variant="rect" width="40%" height={15} />
      </div>
      <div className="d-flex">
        <Skeleton variant="rect" width={100} height={15} />
        <Skeleton className="ms-3" variant="rect" width={20} height={15} />
      </div>
    </div>
  </div>
);

export default Task;
