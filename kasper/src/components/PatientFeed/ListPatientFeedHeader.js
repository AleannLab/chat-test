import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { useStores } from 'hooks/useStores';
import debounce from 'lodash.debounce';
import Button from '@material-ui/core/Button';
import { useQueryClient } from 'react-query';
import ClearIcon from '@material-ui/icons/Clear';
import { IconButton, Fade, Badge, CircularProgress } from '@material-ui/core';
import Menu from './Menu';
import RefreshIcon from '@material-ui/icons/Refresh';
import { withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    background: '#243656',
    borderRadius: '0px',
    borderBottom: '1px #293D63 solid',
  },
  selectedCard: {
    background: '#0D2145',
    borderRadius: '0px',
    borderBottom: '1px #293D63 solid',
    '& > div': {
      borderLeft: '3px #F4266E solid',
    },
  },
  searchIcon: {
    color: '#D2D2D2',
    height: '25px',
    marginLeft: '10px',
  },
  InputBase: {
    background: '#243656',
    width: '90%',
    fontFamily: 'Montserrat',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '14px',
    color: '#FFFFFF',
    marginLeft: '8px',
    opacity: '0.8',
  },
  newSmsBtn: {
    padding: '1rem',
    background: '#243656',
    borderBottom: '1px solid #293D63',
  },
  unseenSmsBtn: {
    padding: '0.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.8rem',
    fontFamily: 'Montserrat',
    cursor: 'pointer',
    color: '#000000',
    backgroundColor: '#d9e2f3',
  },
  refreshIcon: {
    color: '#cccccc',
    cursor: 'pointer',
  },
  refreshSpinner: {
    height: '1rem !important',
    width: '1rem !important',
    color: '#cccccc',
  },
}));

const CustomBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: '#F4266E',
    height: 8,
    width: 8,
    border: '1px solid #FFFFFF',
    marginTop: 4,
    marginLeft: 8,
  },
}))(Badge);

export function ListPatientFeedHeader(props) {
  const classes = useStyles();
  const { patientsFeed } = useStores();
  const queryClient = useQueryClient();

  const refreshPatientFeed = debounce((filter) => {
    queryClient.resetQueries(['patientFeed', filter]);
    patientsFeed.setPatientSearch(filter);
    queryClient.refetchQueries(['patientFeed', filter]);
  }, 500);

  const handleNewSMSClick = () => {
    patientsFeed.setNewSMSPhoneNumber(null);
    patientsFeed.setIsNewSMS(true);
  };

  const [clearFieldBtn, setClearFieldBtn] = useState(false);
  const searchField = useRef();

  function ClearField() {
    searchField.current.value = '';
    refreshPatientFeed('');
    if (clearFieldBtn !== false) {
      setClearFieldBtn(false);
    }
  }

  /* Clear field on open */
  useEffect(() => {
    let searchF = searchField.current.value;
    return () => {
      searchF = '';
      refreshPatientFeed('');
      patientsFeed.setSelectedPatient(null);
    };
  }, []);

  function AppearClearField(event) {
    if (event.target.value.length > 0) setClearFieldBtn(true);
    else setClearFieldBtn(false);
  }

  const handleRefreshBtnClick = async () => {
    patientsFeed.refetchPatientFeed();
    if (patientsFeed.selectedPatient) {
      await queryClient.refetchQueries([
        'patient-chat',
        patientsFeed.selectedPatient.phone_no,
      ]);
    }
    patientsFeed.setPendingUnseenSms(false);
  };

  return (
    <div>
      <Card
        style={{ height: '64px', display: 'flex', alignItems: 'center' }}
        className={[
          classes.card,
          'd-flex justify-content-between align-items-center px-4',
        ].join(' ')}
      >
        <span
          style={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: '24px',
            fontFamily: 'Playfair Display',
          }}
        >
          Patient Feed
        </span>

        <div className="d-flex align-items-center">
          {patientsFeed.isRefetching ? (
            <CircularProgress className={classes.refreshSpinner} />
          ) : (
            <CustomBadge
              badgeContent=" "
              variant="dot"
              invisible={!patientsFeed.pendingUnseenSms}
            >
              <RefreshIcon
                className={classes.refreshIcon}
                onClick={handleRefreshBtnClick}
              />
            </CustomBadge>
          )}

          <Menu className="ms-2" />
        </div>
      </Card>
      <Card
        style={{ height: '50px', display: 'flex', alignItems: 'center' }}
        className={[
          classes.card,
          'd-flex justify-content-between align-items-center px-2',
        ].join(' ')}
      >
        <SearchIcon className={classes.searchIcon} />
        <InputBase
          className={classes.InputBase}
          placeholder="Search..."
          defaultValue={patientsFeed.patientSearch || ''}
          onChange={(e) => {
            refreshPatientFeed(e.target.value);
            AppearClearField(e);
          }}
          inputRef={searchField}
        />
        <Fade in={clearFieldBtn}>
          <IconButton style={{ color: '#D2D2D2' }} onClick={() => ClearField()}>
            <ClearIcon style={{ fontSize: '18px' }} />
          </IconButton>
        </Fade>
      </Card>

      <div className={classes.newSmsBtn}>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={handleNewSMSClick}
          disabled={patientsFeed.loading}
        >
          New SMS
        </Button>
      </div>
    </div>
  );
}
