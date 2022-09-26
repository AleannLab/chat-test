import React, { useState } from 'react';
import styles from './index.module.css';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = () =>
  makeStyles(() => ({
    scrollPaper: {
      display: 'flex',
      justifyContent: 'flex-start',
      marginTop: '60vh',
    },
    dialogPaper: {
      maxHeight: '90vh',
    },
  }));

const Modal = ({
  size,
  header,
  body,
  footer,
  defaultState,
  onClose,
  enableMargin,
  fullWidth,
  allowClosing,
  customPosition,
  id,
}) => {
  const [open, setOpen] = useState(defaultState);
  const classes = useStyles()();

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Dialog
      id={id}
      onClose={handleClose}
      open={open}
      disableBackdropClick
      fullWidth={fullWidth}
      maxWidth={size}
      classes={{
        scrollPaper: customPosition ? classes.scrollPaper : '',
        paper: classes.dialogPaper,
      }}
    >
      <MuiDialogTitle disableTypography className="p-0">
        <div className="d-flex justify-content-end">
          <IconButton
            aria-label="close"
            onClick={handleClose}
            disabled={!allowClosing}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <div className={styles.titleText}>{header}</div>
      </MuiDialogTitle>
      <MuiDialogContent className={enableMargin ? 'mx-5 mb-5' : 'p-0'}>
        {body}
        {footer && (
          <MuiDialogActions className="px-0">{footer}</MuiDialogActions>
        )}
      </MuiDialogContent>
    </Dialog>
  );
};

Modal.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  header: PropTypes.elementType,
  body: PropTypes.element,
  footer: PropTypes.element,
  defaultState: PropTypes.bool,
  onClose: PropTypes.func,
  enableMargin: PropTypes.bool,
  fullWidth: PropTypes.bool,
  allowClosing: PropTypes.bool,
  customPosition: PropTypes.bool,
};

Modal.defaultProps = {
  size: 'md',
  header: '',
  body: '',
  footer: '',
  defaultState: true,
  onClose: () => {},
  enableMargin: true,
  fullWidth: true,
  allowClosing: true,
  customPosition: false,
};

export default Modal;
