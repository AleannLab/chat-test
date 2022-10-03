import React, { useState, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import WarningIcon from '@material-ui/icons/Warning';
import { useHistory } from 'react-router-dom';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

const HubspotController = () => {
  const [supportBtnAction, setSupportBtnAction] = useState(0);
  const [userShowHSChat, setUserHSChat] = useState();

  const history = useHistory();

  const failIcnTheme = createTheme({
    overrides: {
      MuiIconButton: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.54)',
          },
        },
      },
    },
  });

  const setBtnActionEnum = {
    SUPPORT_OFF: -1,
    SUPPORT_ON: 1,
    SUPPORT_LOADING: 0,
    SUPPORT_BROKEN: -2,
  };

  useEffect(() => {
    if (
      typeof window.HubSpotConversations !== 'undefined' &&
      window.HubSpotConversations != null
    ) {
      window.HubSpotConversations.widget.remove();
      setUserHSChat(false);
      setSupportBtnAction(-1);
    } else {
      setSupportBtnAction(-2);
    }
  }, []);

  useEffect(() => {
    async function runChatload() {
      if (userShowHSChat === true) {
        await setSupportBtnAction(0);
        await window.HubSpotConversations.widget.refresh();
        await window.HubSpotConversations.widget.load({ widgetOpen: true });
        await setSupportBtnAction(1);
      } else if (userShowHSChat === false || setUserHSChat == undefined) {
        window.HubSpotConversations.widget.remove();
        setSupportBtnAction(-1);
      }
    }
    runChatload();
  }, [userShowHSChat]);

  const HubspotChatLoaderEnum = () => {
    switch (supportBtnAction) {
      case setBtnActionEnum.SUPPORT_OFF: {
        return (
          <IconButton
            style={{ color: 'white' }}
            variant="contained"
            onClick={() => {
              setUserHSChat(true);
            }}
          >
            {' '}
            <ContactSupportIcon />{' '}
          </IconButton>
        );
      }
      case setBtnActionEnum.SUPPORT_ON: {
        return (
          <IconButton
            color="secondary"
            variant="contained"
            onClick={() => {
              setUserHSChat(false);
            }}
          >
            {' '}
            <ContactSupportIcon />{' '}
          </IconButton>
        );
      }
      case setBtnActionEnum.SUPPORT_LOADING: {
        return (
          <IconButton disabled style={{ color: 'silver' }}>
            {' '}
            <HourglassEmptyIcon />{' '}
          </IconButton>
        );
      }
      case setBtnActionEnum.SUPPORT_BROKEN: {
        //const failMsg = `Live chat failed to load. Please try refreshing the page to see if live chat can successfully load again. (Do you have an adblocker on?)`;
        return (
          <span>
            <MuiThemeProvider theme={failIcnTheme}>
              <IconButton
                style={{ color: 'silver' }}
                onClick={() => {
                  history.push('/dashboard/settings/support');
                }}
              >
                <WarningIcon />
              </IconButton>
            </MuiThemeProvider>
          </span>
        );
      }
    }
  };

  return (
    <>
      <HubspotChatLoaderEnum />
    </>
  );
};

export default HubspotController;
