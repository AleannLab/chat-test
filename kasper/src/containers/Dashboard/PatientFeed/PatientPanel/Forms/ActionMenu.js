import React, { useRef, useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PatientData from '../../PatientData';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
    width: '20%',
    marginTop: '4px',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    PopoverClasses={{ root: 'action-menu-popover-class' }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    paddingTop: '0',
    paddingBottom: '0',
  },
}))(MenuItem);

const ActionMenu = ({ options }) => {
  const containerRef = useRef(null);
  const [showPatientData, setShowPatientData] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div ref={containerRef} className="action-menu-container">
      <Button
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="outlined"
        onClick={handleClick}
        style={{ width: '100%' }}
        className="action-menu-button"
      >
        Action
      </Button>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        container={containerRef.current}
      >
        {options.map((option) => (
          <StyledMenuItem key={option.key} disabled={option.disabled}>
            <ListItemIcon className="action-menu-item-icon">
              {option.icon}
            </ListItemIcon>
            <ListItemText
              style={{ fontSize: '12px' }}
              disableTypography
              primary={option.text}
              onClick={() => {
                option.handleClick();
                setAnchorEl(null);
              }}
            />
          </StyledMenuItem>
        ))}
      </StyledMenu>
      {showPatientData === true && (
        <PatientData onClose={() => setShowPatientData(false)} />
      )}
    </div>
  );
};

export default React.memo(ActionMenu);
