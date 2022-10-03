import React, { useEffect, useRef, useState, Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { observer } from 'mobx-react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { uniq, isEmpty } from 'lodash';
import moment from 'moment-timezone';
import InputBox from '../Messages/InputBox';
import { Reply } from 'components/Messages/Reply';
import { useStores } from 'hooks/useStores';
import  NoMessagesIcon from 'assets/images/no-messages.svg';
import { ChatHeader } from './ChatHeader';
import ChatMessage from './ChatMessage';
import Divider from 'components/Divider';
import styles from './index.module.css';
import { getUserIds } from 'helpers/getUserIds';

const NoMessageText = () => {
  return (
    <div
      className="flex-grow-1 d-flex flex-column justify-content-center align-items-center"
      style={{ height: '100%' }}
    >
      <div className="p-3">
        <NoMessagesIcon />
      </div>
      <div className={styles.noMessageText}>No messages yet</div>
    </div>
  );
};

const NoSelectedConversation = () => {
  return (
    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <div className="p-3">
        <NoMessagesIcon />
      </div>
      <div className={styles.noMessageText}>
        Select a User to start your Conversation
      </div>
    </div>
  );
};

const OfficeChat = ({
  onSend,
  users,
  channels,
  selectedChannel,
  setSelectedChannel,
  setMessages,
  messages,
}) => {
  const {
    kittyOfficeChat,
    authentication,
    authentication: { user },
  } = useStores();
  const scrollbars = useRef(null);
  const inputBoxRef = useRef(null);
  const [oldScrollHeight, setOldScrollHeight] = useState(0);
  const [oldScrollTop, setOldScrollTop] = useState(0);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [paginator, setPaginator] = useState(false);
  const [replayedMessage, setReplayedMessage] = useState(null);
  const [isFetchingPreviousPage, setIsFetchingPreviousPage] = useState(false);
  const [membersAll, setMembers] = useState([]);
  const isSelectChannel = !isEmpty(selectedChannel);

  const fetchChannelMessages = async () => {
    const result = await kittyOfficeChat.messagesPaginator(selectedChannel);
    if (result) {
      setMessages(result.items);
      setPaginator(result);
    }
    if (scrollbars.current) {
      scrollbars.current?.scrollToBottom();
    }
  };

  useEffect(() => {
    if (isSelectChannel) {
      fetchChannelMessages();
      setMembersChannel();
    }
  }, [selectedChannel]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const result = await kittyOfficeChat.sendMessage(
      message,
      selectedChannel,
      replayedMessage,
    );
    if (scrollbars.current) {
      scrollbars.current?.scrollToBottom();
    }
    props.setFieldValue('chat', '');
    setReplayedMessage(null);
  };

  const fetchNextMessages = async (paginator) => {
    if (paginator.hasNextPage) {
      const result = await paginator.nextPage();
      setMessages((old) => [...old, ...result.items]);
      setPaginator(result);
      if (scrollbars.current) {
        if (!scrolledToBottom) {
          scrollbars.current?.scrollToBottom();
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

  const handleOnScroll = (event) => {
    setOldScrollTop(event.target.scrollTop);
    if (isFetchingPreviousPage) {
      setOldScrollHeight(scrollbars.current.getScrollHeight());
    } else if (
      event.target.scrollTop < oldScrollTop - 1 &&
      event.target.scrollTop < 150 &&
      !isFetchingPreviousPage
    ) {
      setIsFetchingPreviousPage(true);
      fetchNextMessages(paginator);
      setOldScrollHeight(scrollbars.current.getScrollHeight());
    }
  };

  const groupMessagesByDate = () => {
    let groups = {};
    if (messages.length > 0) {
      const dates = uniq(
        messages.map((message) => {
          return moment
            .utc(message.createdTime)
            .tz(user.timezone)
            .format('dddd, MMMM Do');
        }),
      );
      dates.forEach((date) => {
        const nMessages = messages.filter((message) => {
          const messageDate = moment
            .utc(message.createdTime)
            .tz(user.timezone)
            .format('dddd, MMMM Do');
          return messageDate == date;
        });
        groups[date] = nMessages;
      });
    }
    return groups;
  };

  const handleCancel = () => {
    setReplayedMessage(null);
  };

  const groupedMessage = groupMessagesByDate();

  const isTodayDate = (date) =>
    moment.utc().tz(user.timezone).format('dddd, MMMM Do') == date;

  return (
    <div className={styles.chatContainer}>
      {isSelectChannel && (
        <ChatHeader
          users={users}
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          channels={channels}
        />
      )}
      {isSelectChannel ? (
        <div className={styles.chatListContainer}>
          {
            <Scrollbars
              ref={scrollbars}
              renderTrackHorizontal={(props) => <div {...props} />}
              onScroll={handleOnScroll}
            >
              {isFetchingPreviousPage && (
                <span>
                  Loading...{' '}
                  <CircularProgress className={styles.chatSendingIndicator} />
                </span>
              )}
              {messages && messages.length > 0 ? (
                <div className={styles.chatList}>
                  {Object.entries(groupedMessage).map(([key, dMessages]) => {
                    const isToday = isTodayDate(key);
                    return (
                      <Fragment key={key}>
                        {dMessages.map((message) => {
                          return (
                            <ChatMessage
                              users={users}
                              key={message.id}
                              message={message}
                              channel={selectedChannel}
                              setReplayedMessage={setReplayedMessage}
                            />
                          );
                        })}
                        <Divider>
                          {isToday
                            ? 'Today'
                            : moment
                                .utc(dMessages[0].createdTime)
                                .tz(user.timezone)
                                .format('dddd, MMMM Do')}
                        </Divider>
                      </Fragment>
                    );
                  })}
                </div>
              ) : (
                <NoMessageText />
              )}
            </Scrollbars>
          }
        </div>
      ) : (
        <NoSelectedConversation />
      )}

      {isSelectChannel && (
        <>
          {replayedMessage && (
            <Reply
              replayedMessage={replayedMessage}
              handleCancel={handleCancel}
            />
          )}
          <InputBox
            ref={inputBoxRef}
            onSubmit={(value, props) => sendChatMessageToChannel(value, props)}
            shouldDisable={false}
            canText={true}
            enableRapidReplies={false}
          />
        </>
      )}
    </div>
  );
};

export default observer(OfficeChat);
