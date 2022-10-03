import { ButtonBase, IconButton } from '@material-ui/core';
import React from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FastRewindIcon from '@material-ui/icons/FastRewind';
import FastForwardIcon from '@material-ui/icons/FastForward';
import CustomTooltip from 'components/Core/Tooltip';

const Controls = ({
  onAdd,
  onRemove,
  onAddAll,
  onRemoveAll,
  disableAddControls,
  disableRemoveControls,
}) => {
  const buttonStyles = {
    height: 20,
    width: 20,
    background: '#f0f3f8',
    borderRadius: 4,
  };

  return (
    <div
      style={{ marginTop: '100px' }}
      className="d-flex flex-column justify-content-center px-4"
    >
      <div>
        <CustomTooltip
          placement="top-start"
          color="#000"
          title="Move selected user to group"
        >
          <IconButton
            disabled={disableAddControls}
            onClick={onAdd}
            className="mb-2"
            style={buttonStyles}
            variant="contained"
          >
            <PlayArrowIcon style={{ fontSize: '14px' }} />
          </IconButton>
        </CustomTooltip>
        <CustomTooltip
          placement="top-start"
          color="#000"
          title="Remove selected user to group"
        >
          <IconButton
            disabled={disableRemoveControls}
            onClick={onRemove}
            style={buttonStyles}
            variant="contained"
          >
            <PlayArrowIcon
              style={{ transform: 'rotate(180deg)', fontSize: '14px' }}
            />
          </IconButton>
        </CustomTooltip>
      </div>

      <div className="mt-4">
        <CustomTooltip
          placement="top-start"
          color="#000"
          title="Move all user to group"
        >
          <IconButton
            disabled={disableAddControls}
            onClick={onAddAll}
            style={buttonStyles}
            className="mb-2"
            variant="contained"
          >
            <FastForwardIcon fontSize="small" />
          </IconButton>
        </CustomTooltip>
        <CustomTooltip
          placement="top-start"
          color="#000"
          title="Remove selected user to group"
        >
          <IconButton
            disabled={disableRemoveControls}
            onClick={onRemoveAll}
            style={buttonStyles}
            variant="contained"
          >
            <FastRewindIcon fontSize="small" />
          </IconButton>
        </CustomTooltip>
      </div>
    </div>
  );
};

export default Controls;
