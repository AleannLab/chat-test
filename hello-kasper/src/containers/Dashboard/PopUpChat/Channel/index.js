import React, { useEffect, useState } from 'react';
import { Typography, Card } from '@material-ui/core';
import clsx from 'clsx';
import { useStores } from 'hooks/useStores';
import { ChannelAvatar } from 'components/ChannelAvatar';
import { UnreadMessages } from 'components/ChatMessengers/UnreadMessages';
import { OnlineParticipant } from 'components/ChatMessengers/OnlineParticipant';
import { ChatInformation } from 'components/ChatMessengers/ChatInformation';
import { useOfficeChatState } from 'hooks/useOfficeChatState';
import { convertCustomTime } from 'helpers/timezone';
import { cutLine } from 'helpers/cutLine';
import styles from './index.module.css';

const CreateTime = ({ lastReceivedMessage, createdTime }) => {
  return (
    <span className={styles.time}>
      {lastReceivedMessage
        ? convertCustomTime({
            dateTime: lastReceivedMessage.createdTime,
            format: 'hh:mm a',
          })
        : createdTime
        ? convertCustomTime({
            dateTime: createdTime,
            format: 'hh:mm a',
          })
        : 'n/a'}
    </span>
  );
};

const QuantityParticipantGroup = ({ channel }) => {
  const [quantity, setQuantity] = useState(0);
  const {
    kittyOfficeChat,
    authentication: { user },
  } = useStores();
  const setQuantityMembers = async () => {
    const members =
      (await kittyOfficeChat
        .memberListGetter(channel)
        .then((res) => res.filter(({ name }) => name !== user.email))) || [];
    setQuantity(members.length);
  };
  useEffect(() => {
    setQuantityMembers();
  }, []);
  if (!quantity) {
    return null;
  }
  return <span className={styles.quantityMembers}>{quantity} members</span>;
};

const Channel = ({
  participant,
  channel,
  className = '',
  isShowUnderText = false,
  isSelect,
  users,
  ...props
}) => {
  const { countUnreadMessageChannels } = useOfficeChatState();
  const { type, lastReceivedMessage, createdTime, id } = channel;
  const countUnreadMessage = countUnreadMessageChannels[id];
  const { body } = lastReceivedMessage || {};
  const MAX_LENGTH_LAST_MESSAGE = 35;
  const lastMessage = cutLine(body, MAX_LENGTH_LAST_MESSAGE);
  const name = channel.displayName
    ? channel.displayName
    : participant.displayName;

  return (
    <div className={styles.member}>
      <div className={styles.containerAvatar}>
        {!isShowUnderText && !!countUnreadMessage && (
          <UnreadMessages quantity={countUnreadMessage} />
        )}
        <ChannelAvatar users={users} channel={channel} {...props} />
        {!isShowUnderText && (
          <ChatInformation
            participant={participant}
            type={type}
            lastReceivedMessage={lastReceivedMessage}
            users={users}
          />
        )}
      </div>
      <div
        className={clsx(styles.wrapperCard, { [styles.cardSelect]: isSelect })}
      >
        <Card className={clsx(styles.card, { [styles.cardSelect]: isSelect })}>
          <Typography className={className}>{name}</Typography>
          {!isShowUnderText && lastReceivedMessage && (
            <Typography variant="caption" className={styles.lastMessage}>
              {lastMessage}
            </Typography>
          )}
          {isShowUnderText && type === 'DIRECT' && (
            <OnlineParticipant online={participant.presence.online} />
          )}
          {isShowUnderText && (type === 'PUBLIC' || type === 'PRIVATE') && (
            <QuantityParticipantGroup channel={channel} />
          )}
        </Card>
        {!isShowUnderText && (
          <CreateTime
            lastReceivedMessage={lastReceivedMessage}
            createdTime={createdTime}
          />
        )}
      </div>
    </div>
  );
};

export { Channel };
