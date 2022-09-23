import React, { useState } from 'react';
import {
  ClickAwayListener,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import Checkbox from 'components/Core/Checkbox';
import styles from './index.module.css';
import { MoreHoriz } from '@material-ui/icons';

const TaskItem = ({ task, onComplete, onDelete, onEdit }) => {
  const [hoverState, setHoverState] = useState('none');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.target);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div
        className={styles.taskItem}
        onMouseOver={() => setHoverState('')}
        onMouseOut={() => setHoverState('none')}
      >
        {!task.completed ? (
          <div className="d-flex align-items-center justify-content-center">
            <Checkbox onClickFunc={onComplete} />
            <Typography className={styles.taskName}>
              {task.task_name}
            </Typography>
          </div>
        ) : (
          <div className={styles.completedTask}>
            <Checkbox checked defaultDisabled />
            <Typography className={styles.taskName}>
              {task.task_name}
            </Typography>
          </div>
        )}

        <MoreHoriz
          style={{
            visibility: hoverState === 'none' ? 'hidden' : '',
            color: '#F4266E',
          }}
          onClick={handleClick}
        />
        <Menu
          id="task-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={onEdit}>Edit</MenuItem>
          <MenuItem style={{ color: 'red' }} onClick={onDelete}>
            Delete
          </MenuItem>
        </Menu>
      </div>
    </ClickAwayListener>
  );
};

export default TaskItem;
