import React, { useState, Fragment } from 'react';
import { Card, Typography } from '@material-ui/core';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { ReactComponent as InventoryIcon } from 'assets/images/archive.svg';
import styles from './index.module.css';

const ArchiveItem = ({
  setShowArchiveItems,
  archiveChannels,
  isBubble = false,
}) => {
  const [hoverOn, setHoverOn] = useState(false);

  const handleOnClickCard = () => {
    setShowArchiveItems(true);
  };

  return (
    <>
      <Card
        ref={undefined}
        className={styles.card}
        onClick={handleOnClickCard}
        onMouseOver={() => setHoverOn(true)}
        onMouseLeave={() => setHoverOn(false)}
      >
        <div
          className={clsx(styles.content, { [styles.contentBubble]: isBubble })}
        >
          <div className={styles.containerAvatar}>
            <div className={styles.archiveAvatar}>
              <InventoryIcon fill="#fff" className={styles.inventoryIcon} />
            </div>
          </div>

          <div className={styles.containerArchivedGroup}>
            <Typography variant="body1" className={styles.Typography}>
              Archived Groups
            </Typography>
            <Typography variant="caption" className={styles.subtitle}>
              {archiveChannels.map(({ displayName }, i) => {
                const isMoreThenOneGroup = archiveChannels.length > 1;
                const isNotLastItem = (el) => el < archiveChannels.length - 1;
                return (
                  <Fragment key={i}>
                    {displayName}
                    {isMoreThenOneGroup && isNotLastItem(i) && <>{', '}</>}
                  </Fragment>
                );
              })}
            </Typography>
          </div>
        </div>
      </Card>
      <div
        className={clsx(styles.border, { [styles.borderBubble]: isBubble })}
      ></div>
    </>
  );
};

export default observer(ArchiveItem);
