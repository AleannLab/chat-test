import React, { useEffect } from 'react';
import clsx from 'clsx';
import { useAuthToken } from 'hooks/useAuthToken';
import Avatar from 'components/Avatar';
import { Message } from '../Message';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';

const ParticipantMessage = ({
  message,
  memberMessage,
  userName,
  channel,
  isUser,
  time,
  isNextNewMember,
  reactions,
  nestedLevel,
  setReplayedMessage,
  users,
}) => {
  const { kittyOfficeChat, utils } = useStores();
  const setRead = async () => {
    await kittyOfficeChat.readMessage(memberMessage);
  };
  const authToken = useAuthToken();
  const [firstName, lastName] = userName.split(' ');

  const userUuid = users.find(
    (x) => x.email === memberMessage.user.name,
  )?.display_image;

  const imgUrl = utils.prepareMediaUrl({ uuid: userUuid, authToken });
  useEffect(() => {
    if (memberMessage.channelId === channel.id) {
      setRead();
    }
  }, [message]);
  return (
    <div
      className={clsx(styles.wrapperParticipantMessage, {
        [styles.indentsDown]: isNextNewMember,
      })}
    >
      {isNextNewMember ? (
        <Avatar
          firstName={firstName}
          lastName={lastName}
          src={imgUrl}
          id={memberMessage.user.id || ''}
        />
      ) : (
        <span></span>
      )}
      <div className={styles.dataMessage}>
        {isNextNewMember && (
          <span className={styles.nameParticipant}>
            {userName}, {time}
          </span>
        )}
        <div>
          <Message
            message={message}
            isUser={isUser}
            memberMessage={memberMessage}
            reactions={reactions}
            nestedLevel={nestedLevel}
            setReplayedMessage={setReplayedMessage}
          />
        </div>
      </div>
    </div>
  );
};

export { ParticipantMessage };
