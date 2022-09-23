import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import React, { useState } from 'react';
import UploadHoldMusic from './UploadHoldMusic';
import RecordGreeting from './RecordGreeting';
import styles from './index.module.css';
import TextToSpeech from './TextToSpeech';

const TABS = [
  {
    label: 'Upload',
    value: 'upload',
  },
  {
    label: 'Record',
    value: 'record',
  },
  /*
  {
    label: 'Text to Speech',
    value: 'text-to-speech',
  },
  */
];
const Header = () => {
  return (
    <div className={styles.header}>
      <span className="d-flex align-items-center">Voicefile</span>
    </div>
  );
};

const SelectionPanel = ({ setSelectedTab, selectedTab }) => {
  return (
    <div className={styles.tabbingRadio}>
      <RadioGroup
        row
        aria-label="position"
        name="position"
        defaultValue="top"
        value={selectedTab}
        onChange={(e) => setSelectedTab(e.target.value)}
      >
        <FormControlLabel
          value={TABS[0].value}
          control={<Radio color="secondary" />}
          label={TABS[0].label}
        />
        <FormControlLabel
          value={TABS[1].value}
          control={<Radio color="secondary" />}
          label={TABS[1].label}
        />
        <FormControlLabel
          value={TABS[2].value}
          control={<Radio color="secondary" />}
          label={TABS[2].label}
        />
      </RadioGroup>
    </div>
  );
};

const AddGreetingsForm = ({ Id = '', handleClose, GreetingName = '' }) => {
  const [selectedTab, setSelectedTab] = useState(TABS[0].value);

  const renderTabContent = (selectedTab) => {
    switch (selectedTab) {
      case TABS[0].value:
        return <UploadHoldMusic Id={Id} handleClose={handleClose} />;
      case TABS[1].value:
        return <RecordGreeting Id={Id} handleClose={handleClose} />;
      case TABS[2].value:
        return <TextToSpeech Id={Id} handleClose={handleClose} />;

      default:
        return <UploadHoldMusic Id={Id} handleClose={handleClose} />;
    }
  };
  return (
    <div>
      <div className={styles.titleText}>{`Add ${GreetingName} Greetings`}</div>

      <Header GreetingName={GreetingName} />
      <SelectionPanel
        setSelectedTab={setSelectedTab}
        selectedTab={selectedTab}
      />
      {renderTabContent(selectedTab)}
    </div>
  );
};

export default AddGreetingsForm;
