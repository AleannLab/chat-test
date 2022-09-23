import { Button, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import styles from './index.module.css';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { ReactComponent as PencilIcon } from 'assets/images/pencil.svg';

const useStyles = makeStyles({
  noHover: {
    '&:hover': {
      backgroundColor: '#fff !important',
    },
  },
});

const LineItem = ({
  alignLeft,
  alignRight,
  selected,
  editable,
  onClick,
  disabled,
  loading,
}) => {
  const classes = useStyles();
  return (
    <Button
      disabled={disabled}
      disableRipple={!!selected}
      style={{
        cursor: editable ? 'pointer' : 'default',
      }}
      onClick={editable && onClick}
      className={`${styles.lineItem} ${
        alignLeft ? styles.alignedToLeft : styles.alignedToRight
      } ${!editable && classes.noHover} ${selected && styles.selected}`}
      startIcon={
        selected?.icon ? (
          selected?.icon
        ) : loading ? (
          <Skeleton variant="circle" animation="wave" height={14} width={14} />
        ) : (
          <AddCircleIcon style={{ color: '#F4266E', fontSize: 15 }} />
        )
      }
      variant="outlined"
    >
      {selected ? (
        <span
          title={selected?.label}
          style={{
            width: '100%',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textAlign: selected?.label ? 'left' : 'center',
          }}
        >
          {selected?.label ?? (
            <Skeleton animation="wave" height={12} width="100%" />
          )}
        </span>
      ) : loading ? (
        <Skeleton animation="wave" height={12} width="100%" />
      ) : (
        'Add'
      )}
      {editable && !!selected && (
        <PencilIcon height={14} width={14} style={{ marginLeft: 5 }} />
      )}
    </Button>
  );
};

export default LineItem;
