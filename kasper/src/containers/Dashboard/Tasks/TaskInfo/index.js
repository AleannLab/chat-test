import React from 'react';
import Divider from '@material-ui/core/Divider';
import { observer } from 'mobx-react';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

import { useStores } from 'hooks/useStores';
import Checkbox from 'components/Core/Checkbox';
import CommentField from './CommentField';
import { ReactComponent as PencilIcon } from 'assets/images/pencil-task.svg';
import { ReactComponent as AttachmentIcon } from 'assets/images/attachment-task.svg';
import styles from './index.module.css';

const TaskInfo = () => {
  const { tasks } = useStores();

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        {tasks.detailedTaskInfo !== null ? (
          <div className={styles.taskInfo}>
            <div className={styles.taskSubheader}>
              <div>
                <span className={styles.greyedText}>assigned to </span>
                <span className={styles.highlightedText}>
                  @{tasks.detailedTaskInfo.assigned_to_username}{' '}
                </span>
              </div>
              <div
                className={`${styles.taskDate} ${
                  !!tasks.detailedTaskInfo.completed && styles.taskCompletedDate
                }`}
              >
                <CalendarTodayIcon className={styles.dateIcon} />
                <span>{tasks.detailedTaskInfo.date}</span>
              </div>
            </div>
            <div className={styles.checkBoxContainer}>
              <Checkbox
                className={styles.checkBox}
                style={{ opacity: tasks.detailedTaskInfo.completed ? 0.5 : 1 }}
                checked={!!tasks.detailedTaskInfo.completed}
                disableRipple
                onChange={(e) => {
                  tasks.taskStatus({
                    task_id: tasks.detailedTaskInfo.id,
                    completed: tasks.detailedTaskInfo.completed ? 0 : 1,
                  });
                }}
              />
              <div
                className={`${styles.taskLabel} ${
                  !!tasks.detailedTaskInfo.completed &&
                  styles.taskCompletedLabel
                }`}
              >
                {tasks.detailedTaskInfo.label}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.headerText}>Task Info</div>
        )}
      </div>
      <Divider style={{ marginBottom: '-30px' }} />
      <div className={styles.contentContainer}>
        <div className={styles.taskActionsContainer}>
          <span className={styles.taskAction}>
            <span className={styles.taskActionIcon}>+</span> Add Subtask
          </span>
          <Divider style={{ marginTop: '16px' }} />
          <span className={styles.taskAction}>
            <PencilIcon className={styles.taskActionIcon} fill="#BBC1CD" /> Add
            a Note
          </span>
          <Divider style={{ marginTop: '16px' }} />
          <span className={styles.taskAction}>
            <AttachmentIcon className={styles.taskActionIcon} fill="#BBC1CD" />{' '}
            Add Attachment
          </span>
          <Divider style={{ marginTop: '16px' }} />
        </div>
      </div>
      <CommentField />
    </div>
  );
};

export default observer(TaskInfo);
