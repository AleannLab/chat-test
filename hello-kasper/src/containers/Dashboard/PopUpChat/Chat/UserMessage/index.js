import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Done, DoneAll } from '@material-ui/icons';
import { Message } from '../Message';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';

const UserMessage = ({
  message,
  time,
  isUser,
  isNextNewMember,
  memberMessage,
  reactions,
  nestedLevel,
}) => {
  const { kittyOfficeChat } = useStores();
  const [status, setStatus] = useState(false);

  const getStatus = async () => {
    const readReceipts = await kittyOfficeChat.getListMessageReadReceipts(
      memberMessage.id,
    );
    if (readReceipts.status === 200) {
      setStatus(readReceipts.data.page?.totalElements > 0);
    } else {
      setStatus(false);
    }
  };
  useEffect(() => {
    getStatus();
  }, [memberMessage]);
  return (
    <div
      className={clsx(styles.wrapperUserMessage, {
        [styles.indentsDown]: isNextNewMember,
      })}
    >
      <div className={styles.wrapperDataMessage}>
        <div className={styles.dataMessage}>
          {isNextNewMember && (
            <>
              {status ? (
                <DoneAll className={styles.doneIcon} />
              ) : (
                <Done className={clsx(styles.doneIcon, styles.doneIconColor)} />
              )}
              <span className={styles.timeMessage}>{time}</span>
            </>
          )}
        </div>
        <div>
          <Message
            message={message}
            isUser={isUser}
            memberMessage={memberMessage}
            reactions={reactions}
            nestedLevel={nestedLevel}
          />
        </div>
      </div>
    </div>
  );
};

export { UserMessage };
