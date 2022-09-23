import React from 'react';
// import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
// import Tooltip from "@material-ui/core/Tooltip";
// import moment from "moment-timezone";

import { useStores } from 'hooks/useStores';
import AwayGreeting from './AwayGreeting';
import Options from './Options';
import styles from './index.module.css';
import { convertCurrentTime } from 'helpers/timezone';

const OutOfOfficeSettings = () => {
  const {
    authentication,
    phoneFaxAwayGreeting,
    phoneFaxVoicemailGreeting,
    phoneFaxIVRVoicemailGreeting,
  } = useStores();
  const { timezone } = authentication.user || {};

  return (
    <div className={styles.root}>
      <div className={styles.header}>Voicemail and Out of Office</div>
      <div className={styles.info}>
        Away greeting plays based on hours/settings specified below. Callers can
        leave a voicemail after the greeting finishes playing.
      </div>
      <div className={styles.timeZone}>
        <span>
          (GMT{convertCurrentTime({ format: 'Z' })}) {timezone}
        </span>
        {/* <Tooltip title="You can edit timezone in configuration page" placement="top-start" arrow>
                        <HelpOutlineIcon fontSize="small" htmlColor="#9A9A9A" className="ms-2" />
                    </Tooltip> */}
      </div>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionTitleContainer}>
          <span className={styles.sectionTitle}>Voicemail Greeting</span>
        </div>
        <AwayGreeting
          greetingStore={phoneFaxVoicemailGreeting}
          name="phoneFaxVoicemailGreeting"
        />
      </div>

      <div className={styles.sectionContainer}>
        <div className={styles.sectionTitleContainer}>
          <span className={styles.sectionTitle}>Away Greeting</span>
        </div>
        <AwayGreeting
          greetingStore={phoneFaxAwayGreeting}
          name="phoneFaxAwayGreeting"
        />
      </div>

      <div className={styles.sectionContainer}>
        <div className={styles.sectionTitleContainer}>
          <span className={styles.sectionTitle}>IVR Greeting</span>
        </div>
        <AwayGreeting
          greetingStore={phoneFaxIVRVoicemailGreeting}
          name="phoneFaxIVRVoiceMailGreeting"
        />
      </div>

      <div className={styles.sectionContainer}>
        <div className={styles.sectionTitleContainer}>
          <span className={styles.sectionTitle}>Options</span>
        </div>
        <Options />
      </div>
    </div>
  );
};

export default OutOfOfficeSettings;
