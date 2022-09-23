import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import React, { useState } from 'react';
import styles from './index.module.css';
import RecordGreeting from './RecordGreeting';
import SelectHoldMusic from './SelectHoldMusic';
import TextToSpeech from './TextToSpeech';
import UploadHoldMusic from './UploadHoldMusic';

const TABS = [
  {
    label: 'select',
    value: 'select',
  },
  {
    label: 'upload',
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
          value="select"
          control={<Radio color="secondary" />}
          label="Select"
        />
        <FormControlLabel
          value="upload"
          control={<Radio color="secondary" />}
          label="Upload"
        />
        <FormControlLabel
          value="record"
          control={<Radio color="secondary" />}
          label="Record"
        />
        {/*
        <FormControlLabel
          value="text-to-speech"
          control={<Radio color="secondary" />}
          label="Text to Speech"
        />
*/}
      </RadioGroup>
    </div>
  );
};
const HoldMusic = ({
  setSelectedTab: setSelectedTabFooter,
  handleVacationPayload,
  handleClose,
}) => {
  const [selectedTab, setSelectedTab] = useState(TABS[0].value);

  const renderTabContent = (selectedTab) => {
    switch (selectedTab) {
      case TABS[0].value:
        return (
          <SelectHoldMusic
            setSelectedTabFooter={setSelectedTabFooter}
            handleVacationPayload={handleVacationPayload}
            handleClose={handleClose}
          />
        );
      case TABS[1].value:
        return (
          <UploadHoldMusic
            setSelectedTabFooter={setSelectedTabFooter}
            handleVacationPayload={handleVacationPayload}
            handleClose={handleClose}
          />
        );
      case TABS[2].value:
        return (
          <RecordGreeting
            setSelectedTabFooter={setSelectedTabFooter}
            handleVacationPayload={handleVacationPayload}
            handleClose={handleClose}
          />
        );
      case TABS[3].value:
        return (
          <TextToSpeech
            setSelectedTabFooter={setSelectedTabFooter}
            handleVacationPayload={handleVacationPayload}
            handleClose={handleClose}
          />
        );
      default:
        return (
          <SelectHoldMusic
            setSelectedTabFooter={setSelectedTabFooter}
            handleVacationPayload={handleVacationPayload}
            handleClose={handleClose}
          />
        );
    }
  };
  return (
    <div>
      <Header />
      <SelectionPanel
        setSelectedTab={setSelectedTab}
        selectedTab={selectedTab}
      />
      {renderTabContent(selectedTab)}
    </div>
  );
};

export default HoldMusic;
