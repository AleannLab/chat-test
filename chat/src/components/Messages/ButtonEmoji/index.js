import React, { useState, useRef } from 'react';
import { IconButton, Popper, Fade } from '@material-ui/core';
import SentimentSatisfiedAltIcon from '@material-ui/icons/SentimentSatisfiedAlt';
import Picker from '@emoji-mart/react';
import styles from './index.module.css';

const ComponentPicker = ({ setValue, value, positionFocus }) => {
  const onMessageEmojiSelect = (e) => {
    const codesArray = e.unified.split('-').map((el) => '0x' + el);
    const emoji = String.fromCodePoint(...codesArray);
    const newValue = [...value];
    newValue.splice(positionFocus, 0, emoji);
    setValue('chat', newValue.join(''));
  };
  return (
    <Picker
      onEmojiSelect={onMessageEmojiSelect}
      emojiSize={16}
      emojiButtonSize={24}
      theme={'dark'}
      previewPosition={'none'}
    />
  );
};

const ButtonEmoji = ({ setValue, value, positionFocus }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };
  return (
    <>
      <IconButton className={styles.buttonIcon} onClick={handleClick}>
        <SentimentSatisfiedAltIcon className={styles.icon} />
      </IconButton>
      <Popper
        className={styles.popper}
        anchorEl={anchorEl}
        open={open}
        placement={'top-start'}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <ComponentPicker
              setValue={setValue}
              value={value}
              positionFocus={positionFocus}
            />
          </Fade>
        )}
      </Popper>
    </>
  );
};

export { ButtonEmoji };
