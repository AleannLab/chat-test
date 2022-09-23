import React, { useEffect, useState, useRef } from 'react';
import { IconButton, Button } from '@material-ui/core';
import ChatIcon from '@material-ui/icons/Chat';
import CloseRounded from '@material-ui/icons/CloseRounded';
import { isEmpty } from 'lodash';
import clsx from 'clsx';
import { ChannelAvatar } from 'components/ChannelAvatar';
import { useStores } from 'hooks/useStores';
import { getParticipant } from 'helpers/getParticipant';
import { isEqual } from 'helpers/isEqual';
import { UnreadMessages } from 'components/ChatMessengers/UnreadMessages';
import { ChatInformation } from 'components/ChatMessengers/ChatInformation';
import { PopUpChat } from '../index';
import { useOfficeChatState } from 'hooks/useOfficeChatState';
import { useOfficeChatDispatch } from 'hooks/useOfficeChatDispatch';
import { useLocalStorage } from 'hooks/useLocalStorage';
import CustomTooltip from 'components/Core/Tooltip';
import styles from './index.module.css';

const ChatBubbles = ({
  selectChat,
  removeChat,
  handleOpenChat,
  users,
  isActive,
}) => {
  const {
    authentication: { user },
  } = useStores();
  const { countUnreadMessageChannels } = useOfficeChatState();
  return (
    <>
      {selectChat.map((channel) => {
        const { id, lastReceivedMessage, type, displayName } = channel;
        const countUnreadMessage = countUnreadMessageChannels[id];
        const participant = channel.members
          ? getParticipant(channel, user)
          : channel;
        const title = displayName ? displayName : participant.displayName;
        return (
          <CustomTooltip
            key={id}
            placement={'left'}
            color={'#000000'}
            textColor={'#fff'}
            title={isActive ? '' : title}
          >
            <div
              className={clsx(styles.bubblesContainer, {
                [styles.activeBubblesContainer]: isActive,
              })}
              onClick={(event) => handleOpenChat(event, channel)}
            >
              <div className={styles.bubbles}>
                <IconButton
                  data-close={'close'}
                  className={styles.iconCloseBubbles}
                  onClick={() => removeChat(id)}
                >
                  <CloseRounded className={styles.iconClose} />
                </IconButton>
                {!!countUnreadMessage && (
                  <UnreadMessages quantity={countUnreadMessage} />
                )}
                <ChannelAvatar
                  users={users}
                  channel={channel}
                  width={'58px'}
                  height={'58px'}
                />
                <ChatInformation
                  participant={participant}
                  type={type}
                  lastReceivedMessage={lastReceivedMessage}
                  users={users}
                  classNameOnline={clsx(styles.chatInfoOnline, {
                    [styles.activeChatInfo]: isActive,
                  })}
                  classNameAvatar={clsx(styles.chatInfoAvatar, {
                    [styles.activeChatInfo]: isActive,
                  })}
                />
              </div>
            </div>
          </CustomTooltip>
        );
      })}
    </>
  );
};

const BubbleButton = ({
  onSend,
  channels,
  selectedChannel,
  setSelectedChannel,
  setMessages,
  messages,
  cleanChatSession,
  users,
}) => {
  const newChannels = useRef([]);
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [showArchiveItems, setShowArchiveItems] = useState(false);
  const [selectChat, setSelectChat] = useLocalStorage([], 'bubbleChats');
  const { isActiveBubbleChat } = useOfficeChatState();
  const [selectParticipant, setSelectParticipant] = useState({});
  const { setResetUnreadCountMessage } = useOfficeChatDispatch();
  const {
    channels: { archive, allChannels },
  } = useOfficeChatState();
  const [channelsRows, setChannelsRows] = useState([]);
  const isSelect = !isEmpty(selectedChannel);
  const isActive = isOpenChat || isSelect;

  const {
    authentication: { user },
  } = useStores();

  const getIsSaveChannels = (newSelectChat) => {
    return newSelectChat.map(({ id }) => id);
  };

  const checkNewSelectChat = () => {
    const NUMBER_ELEMENTS = 1;
    const idSaveChannels = getIsSaveChannels(selectChat);
    const newSelectChat = [...selectChat];
    allChannels.forEach((channel) => {
      const { id } = channel;
      const isPresent = idSaveChannels.includes(id);
      if (isPresent) {
        const indexChat = idSaveChannels.indexOf(id);
        const chat = newSelectChat[indexChat];
        if (!isEqual(chat, channel)) {
          newSelectChat.splice(indexChat, NUMBER_ELEMENTS, channel);
        }
      }
    });
    setSelectChat(newSelectChat);
  };

  const handleOpenChat = ({ target }, channel) => {
    const isClickChat = target.closest('button[data-close="close"]');
    if (!isClickChat) {
      const { id } = channel;
      const participant = channel.members
        ? getParticipant(channel, user)
        : channel;
      setResetUnreadCountMessage(id);
      setIsOpenChat(true);
      setSelectedChannel(channel);
      setSelectParticipant(participant);
    }
  };

  const resetData = () => {
    setSelectedChannel({});
    setSelectParticipant({});
  };

  const handleCloseChat = () => {
    setChannelsRows(newChannels.current);
    setIsOpenChat(false);
    resetData();
    setMessages([]);
    setShowArchiveItems(false);
  };

  const handleRemoveChat = () => {
    const { id } = selectedChannel || {};
    removeChat(id);
  };

  const toggleChat = async () => {
    setIsOpenChat(!isOpenChat);
    resetData();
  };

  const removeChat = (idChat) => {
    if (idChat) {
      const NUMBER_ELEMENTS = 1;
      const NO_FIND_INDEX = -1;
      const indexChat = selectChat.findIndex(({ id }) => id === idChat);
      if (indexChat !== NO_FIND_INDEX) {
        const newSelectChat = [...selectChat];
        newSelectChat.splice(indexChat, NUMBER_ELEMENTS);
        setSelectChat(newSelectChat);
      }
    }
    handleCloseChat();
  };

  const removeAllChat = () => {
    newChannels.current = channels;
    setSelectChat([]);
    handleCloseChat();
  };

  useEffect(() => {
    const regularChannels =
      showArchiveItems && archive.length ? archive : channels;
    setChannelsRows(regularChannels);
    newChannels.current = regularChannels;
    if (selectChat.length) {
      checkNewSelectChat();
    }
  }, [channels, showArchiveItems]);

  return (
    <>
      {isOpenChat && isActiveBubbleChat && (
        <PopUpChat
          onSend={onSend}
          handleCloseChat={handleCloseChat}
          handleRemoveChat={handleRemoveChat}
          setSelectChat={setSelectChat}
          setChannel={setSelectedChannel}
          setSelectParticipant={setSelectParticipant}
          newChannels={newChannels}
          selectParticipant={selectParticipant}
          selectedChannel={selectedChannel}
          selectChat={selectChat}
          channelsRows={channelsRows}
          setChannelsRows={setChannelsRows}
          setMessages={setMessages}
          messages={messages}
          cleanChatSession={cleanChatSession}
          showArchiveItems={showArchiveItems}
          setShowArchiveItems={setShowArchiveItems}
          users={users}
        />
      )}
      {isActiveBubbleChat && (
        <div
          className={clsx(styles.wrapperChatBubbles, {
            [styles.activeWrapperChatBubbles]: isActive,
          })}
        >
          {selectChat.length !== 0 && (
            <>
              {selectChat.length > 1 && (
                <Button
                  onClick={removeAllChat}
                  className={clsx(styles.closeAll, {
                    [styles.activeCloseAll]: isActive,
                  })}
                  classes={{ label: styles.closeAllLabel }}
                >
                  Close ALL
                </Button>
              )}
              <div className={styles.containerChatBubble}>
                <ChatBubbles
                  selectChat={selectChat}
                  removeChat={removeChat}
                  handleOpenChat={handleOpenChat}
                  users={users}
                  isActive={isActive}
                />
              </div>
            </>
          )}
          <IconButton
            className={styles.button}
            variant="text"
            onClick={toggleChat}
          >
            <ChatIcon className={styles.iconChat} />
          </IconButton>
        </div>
      )}
    </>
  );
};

export { BubbleButton };
