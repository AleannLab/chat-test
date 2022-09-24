import React from 'react';
import clsx from 'clsx';
import { ReactComponent as PinnedIcon } from 'assets/images/pin.svg';
import { useOfficeChatDispatch } from 'hooks/useOfficeChatDispatch';
import { Channel } from '../Channel';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';

const CardChannel = ({
  participant,
  handleClickCard,
  isSelect,
  channel,
  users,
  pinned = [],
}) => {
  const { setResetUnreadCountMessage } = useOfficeChatDispatch();
  const {
    authentication: {
      user: { email },
    },
  } = useStores();
  const { id } = channel;
  const handleClick = () => {
    handleClickCard();
    setResetUnreadCountMessage(id);
  };
  return (
    <div
      onClick={handleClick}
      className={clsx(styles.cardMember, { [styles.selectCard]: isSelect })}
    >
      <Channel
        participant={participant}
        channel={channel}
        isSelect={isSelect}
        users={users}
        className={styles.cardName}
      />
      {pinned?.includes(email) && (
        <div className={styles.pin}>
          <PinnedIcon />
        </div>
      )}
    </div>
  );
};

export { CardChannel };
