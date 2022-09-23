import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import React, { useState } from 'react';
import styles from './index.module.css';
import SelectHoldMusic from './SelectHoldMusic';
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
];
const Header = () => {
  return (
    <div className={styles.header}>
      <span className="d-flex align-items-center">Hold Music File</span>
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
      </RadioGroup>
    </div>
  );
};
const HoldMusic = () => {
  const [selectedTab, setSelectedTab] = useState(TABS[0].value);

  const renderTabContent = (selectedTab) => {
    switch (selectedTab) {
      case TABS[0].value:
        return <SelectHoldMusic />;
      case TABS[1].value:
        return <UploadHoldMusic />;
      default:
        return <UploadHoldMusic />;
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
