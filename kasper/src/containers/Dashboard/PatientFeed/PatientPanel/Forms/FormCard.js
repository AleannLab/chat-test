import React, { useState, useRef } from 'react';
import moment from 'moment';
import {
  Typography,
  Paper,
  Grid,
  MenuList,
  MenuItem,
  ClickAwayListener,
} from '@material-ui/core';

import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';
import CheckIcon from '@material-ui/icons/Check';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { convertCustomTime } from 'helpers/timezone';

const FORM_CARD_TYPE = {
  Complete: 1,
  Incomplete: 2,
};

const FormCard = ({
  type,
  formKey,
  formID,
  menuOptions,
  formName,
  file_uuid,
  file_name,
  actionDate,
  actionPrefix,
  completed_on,
}) => {
  const menuRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleClose = (e) => {
    if (menuRef.current && menuRef.current.contains(e.target)) {
      return;
    }
    setMenuOpen(false);
  };
  return (
    <Paper
      className="form-card-container"
      style={{
        border: '1px solid #D2D2D2',
        marginTop: '10px',
        width: '100%',
        paddingLeft: '1rem',
        display: 'flex',
        background: '#FFFFFF',
        borderRadius: 3,
        boxShadow: 'none',
      }}
    >
      <Grid container className="mb-3">
        <Grid
          item
          xs={12}
          style={{
            marginTop: '0.7rem',
            marginBottom: '0.7rem',
            display: 'flex',
          }}
        >
          <div
            variant="h6"
            style={{
              fontSize: '11px',
              fontFamily: 'Montserrat',
              fontWeight: 500,
              color: '#3BAA53',
            }}
          >
            {type === FORM_CARD_TYPE.Complete && (
              <>
                <CheckIcon
                  fontSize="small"
                  style={{ width: '11px', height: '15px', marginRight: 4 }}
                />
                <Typography component="span">Complete</Typography>
              </>
            )}

            {type === FORM_CARD_TYPE.Incomplete && (
              <Typography style={{ color: '#999999' }} component="span">
                Incomplete
              </Typography>
            )}
          </div>
          {menuOptions.length > 0 && (
            <div className="context-menu">
              <MoreHorizIcon
                ref={menuRef}
                style={{ cursor: 'pointer' }}
                onClick={() => setMenuOpen((o) => !o)}
              />
              <Popper
                open={menuOpen}
                anchorEl={menuRef.current}
                transition
                placement="right-start"
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: 'center top' }}
                  >
                    <Paper elevation={4} style={{ width: '190px' }}>
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList
                          id="menu-list-grow"
                          className="menu-list-container"
                        >
                          {menuOptions.map((option) => (
                            <MenuItem
                              key={option.name}
                              onClick={() => {
                                option.handleClick(
                                  formKey,
                                  formID,
                                  file_uuid,
                                  completed_on,
                                  file_name,
                                );
                                setMenuOpen(false);
                              }}
                            >
                              {option.icon}
                              <Typography
                                style={{
                                  fontSize: '12px',
                                  fontWeight: '400',
                                  marginLeft: '0.5rem',
                                }}
                              >
                                {option.name}
                              </Typography>
                            </MenuItem>
                          ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </div>
          )}
        </Grid>

        <Grid item xs={12}>
          <div
            style={{
              fontSize: '14px',
              fontFamily: 'Montserrat',
              fontWeight: '500',
              color: '#02122F',
              overflowWrap: 'break-word',
            }}
          >
            {formName}
          </div>
        </Grid>

        {actionPrefix && (
          <Grid>
            <div
              style={{
                marginTop: '1rem',
                fontWeight: '400',
                fontSize: '12px',
                color: '#999999',
              }}
            >
              {`${actionPrefix} ${
                actionDate
                  ? convertCustomTime({
                      dateTime: actionDate,
                      format: 'MM/DD/YYYY',
                    })
                  : 'NA'
              }`}
            </div>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default React.memo(FormCard);
