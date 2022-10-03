import React from 'react';
import Picker from '@emoji-mart/react';
import ReplyIcon from '@material-ui/icons/Reply';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import styles from './index.module.css';

const MessageOptions = ({
  anchorEl,
  open,
  handleClose,
  openEmojisPicker,
  onMessageEmojiSelect,
  openMessageActions,
  handleMenuItem,
}) => {
  return (
    <Menu
      id="long-menu"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      MenuListProps={{ disablePadding: true }}
      anchorEl={anchorEl}
      keepMounted
      open={open}
      onClose={handleClose}
      classes={{ paper: styles.paper }}
    >
      {openEmojisPicker && (
        //TODO need to fix padding 8px
        <Picker
          onEmojiSelect={onMessageEmojiSelect}
          emojiSize={16}
          emojiButtonSize={24}
          theme={'dark'}
          previewPosition={'none'}
        />
      )}
      {openMessageActions && (
        <MenuItem onClick={handleMenuItem}>
          <ListItemIcon classes={{ root: styles.listItemIcon }}>
            <ReplyIcon
              style={{
                color: '#9a9a9a',
                width: '1rem',
                height: '1rem',
              }}
            />
          </ListItemIcon>
          <ListItemText
            classes={{ root: styles.listItemText }}
            primary="Reply"
          />
        </MenuItem>
      )}
    </Menu>
  );
};

export { MessageOptions };
