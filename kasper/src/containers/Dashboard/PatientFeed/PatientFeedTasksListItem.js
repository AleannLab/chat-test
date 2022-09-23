import React from 'react';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import { useHistory } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';

export const PatientFeedTasksListItem = observer((props) => {
  const { tasks } = useStores();
  const [overState1, setoverState1] = React.useState('none');
  const [anchorEl, setAnchorEl] = React.useState(null);
  //const [checked, setChecked] = React.useState(false);
  const history = useHistory();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const task = tasks.datum[props.id];
  return (
    <>
      <Grid
        item
        xs={2}
        style={{
          display: 'flex',
          justifyContent: 'center',
          height: 28,
        }}
      >
        {task.completed ? (
          <Checkbox
            style={{ color: '#02122F', opacity: 0.5 }}
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxOutlinedIcon fontSize="small" />}
            checked={task.completed === 1}
            onChange={(e) => {
              tasks.taskStatus({
                task_id: props.id,
                completed: false,
              });
              //setChecked(e.target.checked);
            }}
          />
        ) : (
          <Checkbox
            style={{ color: '#02122F' }}
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxOutlinedIcon fontSize="small" />}
            name="checkedI"
            onChange={(e) => {
              tasks.taskStatus({
                task_id: props.id,
                completed: true,
              });
              // setChecked(e.target.checked);
            }}
            checked={task.completed || false}
          />
        )}
      </Grid>
      <Grid
        item
        xs={10}
        onMouseOver={() => setoverState1('')}
        onMouseOut={() => setoverState1('none')}
        className="d-flex align-items-center task-label"
      >
        <Typography
          style={{
            textAlign: 'left',
            fontSize: '14px',
            fontFamily: 'Montserrat',
            maxWidth: '85%',
            minWidth: '85%',
            textDecoration: task.completed ? 'line-through' : '',
            opacity: task.completed ? '0.5' : '1',
            overflowWrap: 'break-word',
          }}
        >
          {task.task_name}
        </Typography>
        <Link
          to="#"
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreHorizIcon
            style={{
              visibility: overState1 === 'none' ? 'hidden' : '',
              color: '#F4266E',
            }}
          />
        </Link>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              history.push({
                pathname: '/dashboard/patient-feed/edit-task',
                state: {
                  task_id: props.id,
                },
              });
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            style={{ color: 'red' }}
            onClick={() => {
              handleClose();
              tasks.deleteTask({
                task_id: props.id,
              });
            }}
          >
            Delete
          </MenuItem>
        </Menu>
      </Grid>
    </>
  );
});
