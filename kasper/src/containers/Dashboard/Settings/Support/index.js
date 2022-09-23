import React from 'react';
import styles from './index.module.css';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import WarningIcon from '@material-ui/icons/Warning';
import { IconButton } from '@material-ui/core';
import hubspotChatIcon from './hubspotChatIcon.png';

const Support = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>Support</div>
      <div className={styles.body}>
        To initiate a conversation with Customer support, you can click the chat
        icon on the top right of the page that looks like this icon below
        <div style={{ margin: '10px' }}>
          <ContactSupportIcon />
        </div>
        <div style={{ marginTop: '10px' }}></div>
        In a few moments, you will see the chat icon load on the bottom right of
        your screen. Click it to initiate Customer Support
        <div style={{ marginTop: '10px' }}></div>
        <img src={hubspotChatIcon} alt="Logo" />
        <div style={{ marginTop: '10px' }}></div>
        When you are done talking to customer support and wish to turn it off,
        just click on top right icon that looks like beow
        <div style={{ margin: '10px' }}>
          <IconButton color="secondary" variant="contained">
            {' '}
            <ContactSupportIcon />{' '}
          </IconButton>
        </div>
        If there is an error while Kasper tries to load the Live chat, you will
        instead see this icon below.
        <div style={{ margin: '10px' }}>
          <IconButton disabled style={{ color: 'silver' }}>
            <WarningIcon />
          </IconButton>
        </div>
        If this happens, this usually stems from external software (such as
        browser plugins) blocking our live chat capabilities. Please either
        disable them or whitelist our domain.
        <br></br>
        <div style={{ marginTop: '10px' }}>
          In any case, you can contact your customer support representative or
          send us an email to{' '}
          <a href="mailto:success@meetkasper.com">success@meetkasper.com</a> and
          we will respond as swiftly as possible.
        </div>
      </div>
    </div>
  );
};

export default Support;
