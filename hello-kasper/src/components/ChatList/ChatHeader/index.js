import React, { useRef, useState, useEffect } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import {
  Card,
  IconButton,
  Fade,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@material-ui/core';
import GroupIcon from '@material-ui/icons/Group';
import { ReactComponent as PencilEditIcon } from 'assets/images/pencil_edit.svg';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';

const ChatHeader = ({ setOpen, setChannelsRows, channels, setOpenGroup }) => {
  const {
    authentication: { user },
  } = useStores();
  const newChannels = useRef([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [clearFieldBtn, setClearFieldBtn] = useState(false);
  const searchField = useRef();
  const open = Boolean(anchorEl);

  const searchChannelByName = (event) => {
    const value = event.target.value.toLocaleLowerCase();
    if (value.length) {
      setClearFieldBtn(true);
    } else {
      setClearFieldBtn(false);
    }
    const newChannelsRows = newChannels.current.filter((item) => {
      const { displayName } = item.displayName
        ? item
        : item.members.find(({ name }) => user.email !== name);
      return displayName.toLowerCase().includes(value);
    });
    setChannelsRows(newChannelsRows);
  };

  const clearField = () => {
    searchField.current.value = '';
    setClearFieldBtn(false);
    setChannelsRows(newChannels.current);
  };

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openAddNewChatModel = () => {
    setOpen(true);
    setAnchorEl(null);
  };

  const openAddNewGroupChatModel = () => {
    setOpenGroup(true);
    setAnchorEl(null);
  };
  useEffect(() => {
    newChannels.current = channels;
  }, [channels]);
  return (
    <div>
      <Card
        style={{ height: '59px', display: 'flex', alignItems: 'center' }}
        className={[
          styles.card,
          'd-flex justify-content-between align-items-center px-4',
        ].join(' ')}
      >
        <SearchIcon className={styles.searchIcon} />
        <InputBase
          className={styles.InputBase}
          placeholder="Search..."
          defaultValue={''}
          onChange={searchChannelByName}
          inputRef={searchField}
        />
        <Fade in={clearFieldBtn}>
          <IconButton style={{ color: '#D2D2D2' }} onClick={clearField}>
            <ClearIcon style={{ fontSize: '18px' }} />
          </IconButton>
        </Fade>
        <>
          <div className={styles.iconContainer}>
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <PencilEditIcon
                style={{ fill: '#9A9A9A', marginBottom: '3px' }}
              />
            </IconButton>
            {/* TODO: KAS-3631 - Hide filter buttons from search box */}
            {/* <IconButton>
              <FilterIcon style={{ fill: '#9A9A9A' }} />
            </IconButton> */}
          </div>
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
          >
            <MenuItem
              onClick={openAddNewChatModel}
              classes={{ root: styles.menuListItem }}
            >
              <ListItemIcon classes={{ root: styles.listItemIcon }}>
                <PencilEditIcon
                  style={{ fill: '#9a9a9a', width: '1rem', height: '1rem' }}
                />
              </ListItemIcon>
              <ListItemText
                classes={{ root: styles.listItemText }}
                primary="New chat"
              />
            </MenuItem>
            <MenuItem
              onClick={openAddNewGroupChatModel}
              classes={{ root: styles.menuListItem }}
            >
              <ListItemIcon classes={{ root: styles.listItemIcon }}>
                <GroupIcon style={{ width: '1rem', height: '1rem' }} />
              </ListItemIcon>
              <ListItemText
                classes={{ root: styles.listItemText }}
                primary="New group"
              />
            </MenuItem>
          </Menu>
        </>
      </Card>
    </div>
  );
};

export default ChatHeader;
