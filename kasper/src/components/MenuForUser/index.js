import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Grid, Box } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useFlags } from 'launchdarkly-react-client-sdk';
import styles from './index.module.css';
import Arrow from 'assets/images/arrow.svg';
import Avatar from 'components/Avatar';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import BeamerWidget from 'widgets/BeamerWidget';
import HubspotController from 'widgets/HubspotController';
import NotificationSettings from 'components/NotificationSettings/NotificationSettings';

const MenuForUser = observer(() => {
  const { authentication, utils, users } = useStores();
  const authToken = useAuthToken();
  const history = useHistory();
  const [anchor, setAnchor] = useState(null);
  const user = authentication.user || {};
  const userImg = utils.prepareMediaUrl({
    uuid: user.display_image,
    authToken,
  });
  const { notificationSetting } = useFlags();
  const [firstname, lastname] = user.username.split(' ');

  const handleClick1 = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  const logoutHandler = async () => {
    handleClose();
    await users.notificationUnsubscribe();
    authentication.logout();
  };

  const replacePath = () => {
    handleClose();
    history.replace('/dashboard/settings/my-profile');
  };

  return (
    <Grid container direction="row" justify="flex-end" alignItems="center">
      <Grid item xs component={BeamerWidget} />
      {notificationSetting && <Grid item xs component={NotificationSettings} />}
      <Grid item xs component={HubspotController} />
      <Box mr={2}>
        <p className={styles.userName}>{user.username || 'Username'}</p>
      </Box>
      <Box mr={1}>
        <Link
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick1}
          to="#"
        >
          <Avatar
            id={user.user_id}
            firstName={firstname}
            lastName={lastname}
            src={userImg}
          />
        </Link>
      </Box>
      <Box mr={2}>
        <Link
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick1}
          to="#"
        >
          <img
            name="image"
            src={Arrow}
            alt={'kasper'}
            className={styles.imgArrow}
          />
        </Link>
      </Box>
      <Menu
        id="simple-menu"
        anchorEl={anchor}
        keepMounted
        open={Boolean(anchor)}
        onClose={handleClose}
      >
        <MenuItem onClick={replacePath}>My Profile</MenuItem>

        <MenuItem onClick={logoutHandler}>Logout</MenuItem>
      </Menu>
    </Grid>
  );
});

export default MenuForUser;
