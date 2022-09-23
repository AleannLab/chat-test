import { Button, Grid } from '@material-ui/core';
import Modal from 'components/Core/Modal';
import CallRecording from 'containers/Dashboard/Settings/PhoneAndFax/CallRecording';
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import PhoneNumber from 'awesome-phonenumber';
import styles from './index.module.css';
import HoldMusic from './HoldMusic';
import MissedCallAutoReplyNew from 'components/MissedCallAutoReplyNew';

const TABS = [
  { label: 'Call Recording', value: 'call-recording' },
  { label: 'SMS Auto Reply', value: 'sms-auto-reply' },
  // { label: 'Hold Music', value: 'hold-music' }, // do not remove this code
];

const SettingsModal = () => {
  const [selectedTab, setSelectedTab] = useState(TABS[0].value);
  const history = useHistory();
  const { numberId } = useParams();

  const isSelected = (tab) => {
    return selectedTab === tab;
  };

  const handleClose = () => {
    history.goBack();
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case TABS[0].value:
        return <CallRecording showHeading={false} disablePadding />;
      case TABS[1].value:
        return <MissedCallAutoReplyNew handleClose={handleClose} />;
      case TABS[2].value:
        return <HoldMusic handleClose={handleClose} />;
      default:
        return null;
    }
  };

  const Footer = (
    <>
      <Button
        className="primary-btn me-auto"
        variant="outlined"
        color="primary"
        onClick={handleClose}
      >
        Cancel
      </Button>

      <Button
        className="secondary-btn"
        variant="contained"
        color="secondary"
        onClick={handleClose}
      >
        Save
      </Button>
    </>
  );

  const renderFooter = () => {
    switch (selectedTab) {
      case TABS[0].value:
      case TABS[1].value:
        return Footer;
      default:
        return null;
    }
  };

  var ayt = PhoneNumber.getAsYouType('US');

  const Header = ({ number }) => {
    const formattedNumber = '+1 ' + ayt.reset(number.toString().split('+1')[1]);
    return (
      <div className="d-flex flex-column justify-content-center align-items-center mb-4">
        <span>Settings</span>
        <span
          style={{
            fontWeight: 400,
            fontSize: 14,
            fontFamily: 'Montserrat',
            marginTop: '.5em',
          }}
        >
          {`Phone Number ${formattedNumber}`}
        </span>
      </div>
    );
  };

  return (
    <>
      <Modal
        height={540}
        onClose={handleClose}
        header={<Header number={numberId} />}
        body={
          <Grid spacing={4} container style={{ height: 400 }}>
            <Grid item xs={3}>
              <div className="d-flex flex-column">
                {TABS.map((tab, i) => (
                  <div
                    key={i}
                    className={`${styles.section} ${
                      isSelected(tab.value) ? styles.selectedSection : ''
                    }`}
                    onClick={() => {
                      setSelectedTab(tab.value);
                    }}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
            </Grid>
            <Grid style={{ marginTop: 17 }} xs={9}>
              {renderTabContent()}
            </Grid>
          </Grid>
        }
        footer={renderFooter()}
      />
    </>
  );
};

export default SettingsModal;
