import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.css';
import { Scrollbars } from 'react-custom-scrollbars';
import OtherMessageCollection from '../Messages/OtherMessageCollection/index';
import MyMessageCollection from '../Messages/MyMessageCollection/index';
import InputBox from '../Messages/InputBox';
import Avatar from 'components/Avatar';
import OfficeGroupProfileImage from 'assets/images/office-group-profile.svg';
import Divider from '../Divider';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import OfficeChatSkeleton from './OfficeChatSkeleton';
import { toJS } from 'mobx';
import { useAuthToken } from 'hooks/useAuthToken';
import moment from 'moment-timezone';
import CircularProgress from '@material-ui/core/CircularProgress';
// import { ReactComponent as NoMessagesIcon } from 'assets/images/no-messages.svg';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';

const IntraOfficeChat = observer(() => {
  const { officeChats, authentication } = useStores();
  const scrollbars = useRef(null);
  const inputBoxRef = useRef(null);
  const [oldScrollHeight, setOldScrollHeight] = useState(0);
  const [oldScrollTop, setOldScrollTop] = useState(0);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const rows = 50;

  const queryClient = useQueryClient();

  const fetchChats = React.useMemo(
    () =>
      ({ pageParam }) =>
        officeChats.listApiHandler({ ...pageParam, rows }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const {
    data,
    error,
    fetchPreviousPage,
    isFetchingPreviousPage,
    hasPreviousPage,
    status,
  } = useInfiniteQuery('office-chats', fetchChats, {
    refetchOnMount: false,
    getPreviousPageParam: (lastPage, pages) => {
      if (lastPage[0])
        return {
          tillId: lastPage[0].id,
        };
      else return undefined;
    },
    onSettled: (data, error) => {
      // printScroll("22");
      if (
        oldScrollHeight !== 0 ||
        data.pages[data.pages.length - 1].length > 0
      ) {
        setTimeout(() => {
          if (scrollbars.current) {
            if (!scrolledToBottom) {
              scrollbars.current?.scrollToBottom();
              setScrolledToBottom(true);
            } else {
              // scrollbars.current.view.scroll({
              //     top: scrollbars.current.getScrollHeight() - oldScrollHeight,
              //     behavior: 'smooth',
              // });
              scrollbars.current.scrollTop(
                scrollbars.current.getScrollHeight() - oldScrollHeight,
              );
              // printScroll("33");
            }
          }
        }, 0);
      }
    },
  });

  const postMessageMutation = useMutation(
    ({ message, ref }) => officeChats._createChatApiHandler({ message, ref }),
    {
      onMutate: async ({ message, ref }) => {
        // Cancel current queries for the todos list
        await queryClient.cancelQueries('office-chats');

        // Create optimistic todo
        const optimisticMessage = {
          type: 'CHAT',
          created_at: moment.utc(),
          datetime: moment.utc(),
          deleted: 0,
          direction: 'OUT',
          display_image: authentication.user.display_image,
          email: authentication.user.email,
          from_user: authentication.user.user_id,
          id: ref,
          media: [],
          message,
          text: message,
          mobile_no: authentication.user.mobile_no,
          updated_at: moment.utc(),
          username: authentication.user.username,
          status: 'sending',
        };

        queryClient.setQueryData('office-chats', (old) => {
          if (old.pages && old.pages.length > 0) {
            old.pages[old.pages.length - 1] = [
              ...old.pages[old.pages.length - 1],
              optimisticMessage,
            ];
          }
          return old;
        });

        // Return context with the optimistic todo
        return { optimisticMessage };
      },
      onSuccess: (result, variables, context) => {
        officeChats.appendMessageOrDiscard(result.data);
      },
      onError: (error, variables, context) => {
        // Remove optimistic todo from the todos list
        queryClient.setQueryData('office-chats', (old) => {
          if (old.pages && old.pages.length > 0) {
            old.pages[old.pages.length - 1] = old.pages[
              old.pages.length - 1
            ].filter((message) => message.id !== variables.ref);
          }
          return old;
        });
      },
    },
  );

  useEffect(() => {
    setTimeout(() => {
      scrollbars.current?.scrollToBottom();
    }, 0);
  }, []);

  const submitChat = async (value, props) => {
    const chatText = value.chat.trim();
    props.setFieldValue('chat', '');
    scrollbars.current?.scrollToBottom();
    postMessageMutation.mutate({ message: chatText, ref: uuidv4() });
  };

  // const NoMessageText = (
  //   <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
  //     <div className="p-3">
  //       <NoMessagesIcon />
  //     </div>
  //     <div className={styles.noMessageText}>No messages yet</div>
  //   </div>
  // );

  return (
    <div className={styles.chatContainer}>
      <div className={styles.titleContainer}>
        <Avatar
          id={0}
          src={OfficeGroupProfileImage}
          height="32px"
          width="32px"
        />
        <div className={styles.titleText}>Office Group</div>
      </div>
      <div className={styles.chatListContainer}>
        <Scrollbars
          ref={scrollbars}
          renderTrackHorizontal={(props) => <div {...props} />}
          onScroll={(event) => {
            setOldScrollTop(event.target.scrollTop);
            if (isFetchingPreviousPage) {
              setOldScrollHeight(scrollbars.current.getScrollHeight());
            } else if (
              event.target.scrollTop < oldScrollTop - 100 &&
              event.target.scrollTop < 150 &&
              hasPreviousPage &&
              !isFetchingPreviousPage
            ) {
              fetchPreviousPage();
              setOldScrollHeight(scrollbars.current.getScrollHeight());
            }
          }}
        >
          <div className={styles.chatList}>
            {isFetchingPreviousPage && (
              <span>
                Loading...{' '}
                <CircularProgress className={styles.chatSendingIndicator} />
              </span>
            )}
            {['loading', 'idle'].includes(status) ? (
              <OfficeChatSkeleton />
            ) : status === 'error' ? (
              <p>Error {error.message}</p>
            ) : (
              data.pages.map((group, i) => (
                <React.Fragment key={i}>
                  {group.length > 0 &&
                    officeChats
                      .formattedMessages(group, group.length !== rows)
                      .map((officeChat, i) => {
                        return (
                          <IntelligentMessage key={i} chats={officeChat} />
                        );
                      })}
                </React.Fragment>
              ))
            )}
          </div>
        </Scrollbars>
      </div>
      <InputBox
        ref={inputBoxRef}
        onSubmit={(val, props) => submitChat(val, props)}
        canText={true}
        enableRapidReplies={false}
      />
    </div>
  );
});

export const IntelligentMessage = observer(({ chats }) => {
  const { utils, authentication, users } = useStores();
  const authToken = useAuthToken();
  const { timezone } = authentication.user || {};

  let user = toJS(users.getUserByUserId({ userId: chats[0].from_user }) || {});

  if (chats[0].type === 'DATE')
    return (
      <Divider>
        {moment.utc(chats[0].date).tz(timezone).format('dddd, MMMM Do')}
      </Divider>
    );

  const subTitle = (
    <>
      {user.username}, {moment.utc(chats[0].datetime).tz(timezone).format('LT')}
      {chats[0].direction === 'OUT' && chats[0].status === 'sending' ? (
        <CircularProgress className={styles.chatSendingIndicator} />
      ) : null}
    </>
  );

  const [firstname, lastname] = (user.username ?? '').split(' ');
  const userImg = utils.prepareMediaUrl({
    uuid: user.display_image,
    authToken,
  });
  const messageAvatar = (
    <Avatar
      src={userImg}
      id={chats[0].from_user}
      firstName={firstname}
      lastName={lastname}
      mobileNo={chats[0].mobile_no}
    />
  );

  switch (chats[0].direction) {
    case 'IN': {
      return (
        <OtherMessageCollection
          messages={chats}
          subtitle={subTitle}
          avatar={messageAvatar}
        />
      );
    }
    case 'OUT': {
      return (
        <MyMessageCollection
          messages={chats}
          subtitle={subTitle}
          avatar={messageAvatar}
        />
      );
    }
    default:
      return null;
  }
});

export default IntraOfficeChat;
