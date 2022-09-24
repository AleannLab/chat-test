import React, { forwardRef } from 'react';
import { isEmpty } from 'lodash';
import { Scrollbars } from 'react-custom-scrollbars';
import { useOfficeChatState } from 'hooks/useOfficeChatState';
import { useStores } from 'hooks/useStores';
import { getParticipant } from 'helpers/getParticipant';
import ArchiveItem from 'components/ChatList/ArchiveItem';
import { CardChannel } from '../CardChannel';
import { Chat } from '../Chat';
import styles from './index.module.css';

const CardChannels = ({
  selectChannel,
  channels,
  handleClickCard,
  users,
  showArchiveItems,
  setShowArchiveItems,
}) => {
  const {
    authentication: { user },
  } = useStores();
  const {
    channels: { archive },
  } = useOfficeChatState();
  const isSelectCard = (channelId) =>
    selectChannel && channelId === selectChannel.id;
  return (
    <>
      {!!archive.length && !showArchiveItems && (
        <ArchiveItem
          archiveChannels={archive}
          setShowArchiveItems={setShowArchiveItems}
          isBubble={true}
        />
      )}
      {channels.map((channel) => {
        const { id, properties } = channel;
        const { pinned } = properties || {};
        const activeCart = isSelectCard(id);
        const participant = channel.members
          ? getParticipant(channel, user)
          : channel;
        return (
          <CardChannel
            key={id}
            channel={channel}
            participant={participant}
            isSelect={activeCart}
            users={users}
            pinned={pinned}
            handleClickCard={() => handleClickCard(participant, channel)}
          />
        );
      })}
    </>
  );
};

const BodyContent = ({
  messages,
  channels,
  selectChannel,
  isChannel,
  handleClickCard,
  setReplayedMessage,
  users,
  showArchiveItems,
  setShowArchiveItems,
}) => {
  return (
    <>
      {isChannel ? (
        <Chat
          messages={messages}
          channel={selectChannel}
          setReplayedMessage={setReplayedMessage}
          users={users}
        />
      ) : (
        <CardChannels
          selectChannel={selectChannel}
          channels={channels}
          handleClickCard={handleClickCard}
          users={users}
          showArchiveItems={showArchiveItems}
          setShowArchiveItems={setShowArchiveItems}
        />
      )}
    </>
  );
};

const PopUpChatBody = forwardRef(
  (
    {
      handleClickCard,
      channels,
      selectChannel,
      messages,
      handleOnScroll,
      setReplayedMessage,
      users,
      showArchiveItems,
      setShowArchiveItems,
    },
    ref,
  ) => {
    const isChannel = !isEmpty(selectChannel);

    return (
      <>
        <Scrollbars
          ref={ref}
          className={styles.chatWrapperBody}
          renderTrackHorizontal={(props) => <div {...props} />}
          onScroll={handleOnScroll}
        >
          <div className={styles.chatContainerBody}>
            <BodyContent
              messages={messages}
              channels={channels}
              selectChannel={selectChannel}
              isChannel={isChannel}
              handleClickCard={handleClickCard}
              setReplayedMessage={setReplayedMessage}
              showArchiveItems={showArchiveItems}
              setShowArchiveItems={setShowArchiveItems}
              users={users}
            />
          </div>
        </Scrollbars>
      </>
    );
  },
);

PopUpChatBody.displayName = 'PopUpChatBody';

export { PopUpChatBody };
