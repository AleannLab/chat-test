import React, { Fragment } from 'react';
import { format } from 'date-fns';
import moment from 'moment-timezone';
import { useStores } from 'hooks/useStores';
import Divider from 'components/Divider';
import { UserMessage } from './UserMessage';
import { ParticipantMessage } from './ParticipantMessage';
import styles from './index.module.css';

const Messages = ({ messages, channel, user, setReplayedMessage, users }) => {
  return (
    <>
      {messages.map((memberMessage, index, mes) => {
        const {
          createdTime,
          user: userParticipant,
          body,
          id,
          reactions,
          nestedLevel,
        } = memberMessage;
        const time = format(new Date(createdTime), 'h:mm a');
        const { user: userParticipantOld } =
          index !== mes.length - 1 ? mes[index + 1] : {};
        const isUser = userParticipant.name === user.email;
        const isNextNewMember =
          userParticipantOld?.name !== userParticipant?.name;
        return isUser ? (
          <UserMessage
            key={id}
            message={body}
            time={time}
            isUser={isUser}
            isNextNewMember={isNextNewMember}
            nestedLevel={nestedLevel}
            reactions={reactions}
            memberMessage={memberMessage}
            channel={channel}
          />
        ) : (
          <ParticipantMessage
            key={id}
            message={body}
            time={time}
            isUser={isUser}
            isNextNewMember={isNextNewMember}
            nestedLevel={nestedLevel}
            reactions={reactions}
            memberMessage={memberMessage}
            userName={userParticipant.displayName}
            channel={channel}
            setReplayedMessage={setReplayedMessage}
            users={users}
          />
        );
      })}
    </>
  );
};

const Chat = ({ messages, channel, setReplayedMessage, users }) => {
  const {
    authentication: { user },
  } = useStores();
  const getTodayDate = () => {
    return moment.utc(new Date()).tz(user.timezone).format('dddd, MMMM Do');
  };
  return (
    <div className={styles.wrapperChat}>
      {Object.entries(messages).map(([dateMessages, messages], index) => {
        const isToday = getTodayDate() === dateMessages;
        return (
          <Fragment key={index}>
            <Messages
              messages={messages}
              channel={channel}
              user={user}
              setReplayedMessage={setReplayedMessage}
              users={users}
            />
            <Divider isBorder={false}>
              {isToday ? 'Today' : dateMessages}
            </Divider>
          </Fragment>
        );
      })}
    </div>
  );
};

export { Chat };
