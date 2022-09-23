import React from 'react';
import Grid from '@material-ui/core/Grid';
// import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import { useHistory } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
// import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useStores } from 'hooks/useStores';

const TaskItem = ({ taskData }) => {
  const { tasks } = useStores();
  // const [overState1, setoverState1] = React.useState('none');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const history = useHistory();

  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid container>
      <Grid
        item
        xs={2}
        style={{
          display: 'flex',
          justifyContent: 'center',
          height: 28,
        }}
      >
        {taskData.completed ? (
          <Checkbox
            style={{ color: '#02122F', opacity: 0.5 }}
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxOutlinedIcon fontSize="small" />}
            checked={taskData.completed}
            // onChange={(e) => {
            //     tasks.taskStatus({
            //         task_id: taskData.id,
            //         completed: false
            //     });
            // }}
          />
        ) : (
          <Checkbox
            style={{ color: '#02122F' }}
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxOutlinedIcon fontSize="small" />}
            name="checkedI"
            // onChange={(e) => {
            //     tasks.taskStatus({
            //         task_id: taskData.id,
            //         completed: true
            //     });
            // }}
            checked={taskData.completed || false}
          />
        )}
      </Grid>
      <Grid
        item
        xs={10}
        // onMouseOver={() => setoverState1('')}
        // onMouseOut={() => setoverState1('none')}
        className="d-flex align-items-center task-label"
      >
        <Typography
          style={{
            textAlign: 'left',
            fontSize: '14px',
            fontFamily: 'Montserrat',
            maxWidth: '85%',
            minWidth: '85%',
            textDecoration: taskData.completed ? 'line-through' : '',
            opacity: taskData.completed ? '0.5' : '1',
            overflowWrap: 'break-word',
          }}
        >
          {taskData.task_name}
        </Typography>
        {/* <Link
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={handleClick}
                >
                    <MoreHorizIcon
                        style={{
                            visibility: overState1 === "none" ? "hidden" : "",
                            color: "#F4266E",
                        }}
                    />
                </Link> */}
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
                  task_id: taskData.id,
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
                task_id: taskData.id,
              });
            }}
          >
            Delete
          </MenuItem>
        </Menu>
      </Grid>
    </Grid>
  );
};

export default TaskItem;
