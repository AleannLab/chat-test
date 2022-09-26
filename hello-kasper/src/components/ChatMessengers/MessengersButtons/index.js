import React from 'react';
import { IconButton } from '@material-ui/core';
import clsx from 'clsx';
import SentimentSatisfiedAltIcon from '@material-ui/icons/SentimentSatisfiedAlt';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import styles from './index.module.css';

const MessengersButtons = ({
  handleOpenEmojisPicker,
  handleOpenMessageActions,
}) => {
  return (
    <>
      <IconButton
        className={clsx(
          styles.iconButtonSentimentSatisfiedAlt,
          styles.iconButton,
        )}
        onClick={handleOpenEmojisPicker}
      >
        <SentimentSatisfiedAltIcon />
      </IconButton>
      <IconButton
        className={clsx(styles.iconButtonMoreHoriz, styles.iconButton)}
        onClick={handleOpenMessageActions}
      >
        <MoreHorizIcon />
      </IconButton>
    </>
  );
};

export { MessengersButtons };
