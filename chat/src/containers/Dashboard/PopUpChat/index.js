import React, { useState, useEffect, useRef, useMemo } from 'react';
import { isEmpty } from 'lodash';
import { useStores } from 'hooks/useStores';
import { PopUpChatHeader } from './PopUpChatHeader';
import { PopUpChatBody } from './PopUpChatBody';
import { PopUpChatFooter } from './PopUpChatFooter';
import { groupMessagesByDate } from 'helpers/groupMessagesByDate';
import styles from './index.module.css';
import { getUserIds } from 'helpers/getUserIds';

const PopUpChat = ({
  onSend,
  handleCloseChat,
  handleRemoveChat,
  setSelectChat,
  setChannel,
  setSelectParticipant,
  selectParticipant,
  selectedChannel,
  selectChat,
  channelsRows,
  newChannels,
  setMessages,
  messages,
  cleanChatSession,
  setChannelsRows,
  showArchiveItems,
  setShowArchiveItems,
  users,
}) => {
  const {
    kittyOfficeChat,
    authentication,
    users: usersStore,
    authentication: { user },
  } = useStores();
  const scrollbars = useRef(null);
  const [oldScrollHeight, setOldScrollHeight] = useState(0);
  const [oldScrollTop, setOldScrollTop] = useState(0);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [isFetchingPreviousPage, setIsFetchingPreviousPage] = useState(false);
  const [paginator, setPaginator] = useState({});
  const [replayedMessage, setReplayedMessage] = useState(null);
  const isSelect = !isEmpty(selectedChannel);
  const messagesChat = groupMessagesByDate(messages, user);
  const [membersAll, setMembers] = useState([]);
  const idSaveChannels = useMemo(
    () => selectChat.map(({ id }) => id),
    [selectChat],
  );
  const removeSelectParticipant = () => {
    setSelectParticipant({});
    setChannel({});
    setMessages([]);
  };

  const searchParticipants = (event) => {
    const value = event.target.value.toLowerCase();
    const newChannelsRows = newChannels.current.filter((item) => {
      const { displayName } = item.displayName
        ? item
        : item.members.find(({ name }) => user.email !== name);
      return displayName.toLowerCase().includes(value);
    });
    setChannelsRows(newChannelsRows);
  };
  const callScrollBottom = () => {
    scrollbars.current?.scrollToBottom();
  };

  const fetchChannelMessages = async () => {
    if (isSelect) {
      const result = await kittyOfficeChat.messagesPaginator(selectedChannel);
      setPaginator(result);
      setMessages(result?.items);
      callScrollBottom();
    }
  };

  const saveChat = () => {
    setSelectChat((current) => {
      const { id } = selectedChannel;
      const isCheck = !idSaveChannels.includes(id);
      if (isCheck || !current.length) {
        current.push(selectedChannel);
        return [...current];
      }
      return current;
    });
    handleCloseChat();
    removeSelectParticipant();
  };

  const handleCancel = () => {
    setReplayedMessage(null);
  };

  const fetchNextMessages = async (paginator) => {
    if (paginator?.hasNextPage) {
      const result = await paginator?.nextPage();
      setMessages((old) => [...old, ...result.items]);
      setPaginator(result);
      if (scrollbars.current) {
        if (!scrolledToBottom) {
          callScrollBottom();
          setScrolledToBottom(true);
        } else {
          scrollbars.current.scrollTop(
            scrollbars.current.getScrollHeight() - oldScrollHeight,
          );
        }
      }
    }
    setIsFetchingPreviousPage(false);
  };

  const handleOnScroll = ({ target }) => {
    const { scrollTop } = target;
    setOldScrollTop(scrollTop);
    if (isFetchingPreviousPage) {
      setOldScrollHeight(scrollbars.current?.getScrollHeight());
    } else if (
      scrollTop < oldScrollTop - 1 &&
      scrollTop < 150 &&
      !isFetchingPreviousPage
    ) {
      setIsFetchingPreviousPage(true);
      fetchNextMessages(paginator);
      setOldScrollHeight(scrollbars.current?.getScrollHeight());
    }
  };

  const setMembersChannel = async () => {
    if (selectedChannel?.id) {
      const members =
        (await kittyOfficeChat
          .memberListGetter(selectedChannel)
          .then((res) =>
            res?.filter(({ name }) => name !== authentication.user.email),
          )) || [];
      setMembers(members);
    }
  };

  const sendChatMessageToChannel = async (value, props) => {
    const message = value.chat.trim();
    onSend(message, membersAll, users);
    await kittyOfficeChat.sendMessage(
      message,
      selectedChannel,
      replayedMessage,
    );
    if (replayedMessage) {
      handleCancel();
    }
    props.setFieldValue('chat', '');
    callScrollBottom();
  };

  const handleClickCard = (participant, channel) => {
    setSelectParticipant(participant);
    setChannel(channel);
  };
  useEffect(() => {
    fetchChannelMessages();
    if (isSelect) {
      setMembersChannel();
    }
  }, [selectedChannel]);

  useEffect(() => {
    cleanChatSession();
    return () => cleanChatSession();
  }, []);
  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatContainer}>
        <PopUpChatHeader
          searchParticipants={searchParticipants}
          selectParticipant={selectParticipant}
          handleRemoveChat={handleRemoveChat}
          saveChat={saveChat}
          selectedChannel={selectedChannel}
          users={users}
          showArchiveItems={showArchiveItems}
          setShowArchiveItems={setShowArchiveItems}
        />
        <PopUpChatBody
          handleClickCard={handleClickCard}
          channels={channelsRows}
          selectChannel={selectedChannel}
          messages={messagesChat}
          handleOnScroll={handleOnScroll}
          setReplayedMessage={setReplayedMessage}
          ref={scrollbars}
          users={users}
          showArchiveItems={showArchiveItems}
          setShowArchiveItems={setShowArchiveItems}
        />
        <PopUpChatFooter
          isSelect={isSelect}
          sendChatMessageToChannel={sendChatMessageToChannel}
          replayedMessage={replayedMessage}
          handleCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export { PopUpChat };
