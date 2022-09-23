import React, { useEffect } from 'react';
import { observer } from 'mobx-react';

import ArchivedSections from './ArchivedSections';
import UnarchivedSections from './UnarchivedSections';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';

const PaperlessFormSections = () => {
  const { formGroups, paperlessForm } = useStores();

  useEffect(() => {
    return () => paperlessForm.resetSelectedSections();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.root}>
      {formGroups.showArchived ? <ArchivedSections /> : <UnarchivedSections />}
    </div>
  );
};

export default observer(PaperlessFormSections);
