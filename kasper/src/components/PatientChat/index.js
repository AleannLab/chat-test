import React, { useEffect, useRef, useState, useMemo } from 'react';
import styles from './index.module.css';
import { Scrollbars } from 'react-custom-scrollbars';
import OtherMessageCollection from '../Messages/OtherMessageCollection/index';
import MyMessageCollection from '../Messages/MyMessageCollection/index';
import InputBox from '../Messages/InputBox';
import Divider from '../Divider';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import PhoneNumber from 'awesome-phonenumber';
import Skeleton from '@material-ui/lab/Skeleton';
import PhoneNumberInput from './PhoneNumberInput';
import KasperImg from 'assets/images/kasper_default_logo.svg';
import Avatar from 'components/Avatar';
import PatientChatSkeleton from './PatientChatSkeleton';
import { useAuthToken } from 'hooks/useAuthToken';
import moment from 'moment-timezone';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ReactComponent as NoMessagesIcon } from 'assets/images/no-messages.svg';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import { isEmpty } from 'lodash';

// TODO: Do not delete, temporarily commented for future use
// import SearchIcon from "@material-ui/icons/Search";
// import InputBase from "@material-ui/core/InputBase";

const PatientChat = observer(() => {
  const { patientChats, patientsFeed, notification, authentication } =
    useStores();

  const scrollbars = useRef(null);
  const inputBoxRef = useRef(null);
  const [oldScrollHeight, setOldScrollHeight] = useState(0);
  const [oldScrollTop, setOldScrollTop] = useState(0);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const selectedPatient = useMemo(
    () =>
      patientsFeed.selectedPatient !== null ? patientsFeed.selectedPatient : {},
    [patientsFeed.selectedPatient],
  );

  const queryClient = useQueryClient();

  const targetNumber = () =>
    patientsFeed.isNewSMS
      ? patientsFeed.newSMSPhoneNumber
      : selectedPatient.phone_no;

  useEffect(() => {
    setTimeout(() => {
      if (scrollbars.current) scrollbars.current?.scrollToBottom();
    }, 0);
  }, [selectedPatient]);

  const fetchChats = useMemo(
    () =>
      ({ queryKey, pageParam }) => {
        // eslint-disable-next-line no-unused-vars
        const [_key, phone_no] = queryKey; // NOSONAR
        return patientChats.listApiHandler({
          participant_did: phone_no,
          ...pageParam,
          rows: patientsFeed.NUM_RECORDS,
        });

        // TODO handle the errors thrown
      },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const {
    data,
    error,
    fetchPreviousPage,
    isFetchingPreviousPage,
    hasPreviousPage,
    isFetching,
    status,
    refetch,
  } = useInfiniteQuery(['patient-chat', targetNumber()], fetchChats, {
    getPreviousPageParam: (lastPage, pages) => {
      if (lastPage[0])
        return {
          older_than_uuid: lastPage[0].uuid,
        };
      else return undefined;
    },
    onSettled: (data, error) => {
      // printScroll("22");
      if (
        oldScrollHeight !== 0 ||
        (!!data &&
          data.pages &&
          (data.pages[data.pages.length - 1]?.length ?? 0) > 0)
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
    enabled: !!selectedPatient.phone_no,
  });

  const postMessageMutation = useMutation(
    ({ message, toDid, ref }) =>
      patientChats._createChatApiHandler({ message, toDid, ref }),
    {
      onMutate: async ({ message, toDid, ref }) => {
        if (patientsFeed.isNewSMS) {
          notification.showInfo('Sending Message');
          patientsFeed.setSelectedPatient({
            id: targetNumber(),
            phone_no: targetNumber(),
          });
        }

        // Cancel current queries for the todos list
        await queryClient.cancelQueries(['patient-chat', targetNumber()]);

        // Create optimistic todo
        const optimisticMessage = {
          type: 'CHAT',
          from_did: '',
          to_did: toDid,
          text: message,
          datetime: moment.utc(),
          direction: 'OUT',
          seen: false,
          username: authentication.user.user_id,
          uuid: ref,
          media: [],
          status: 'sending',
          id: ref,
          combinationId: null,
        };

        queryClient.setQueryData(
          ['patient-chat', targetNumber()],
          (old = {}) => {
            if (!old.pages) old.pages = [[]];
            if (old.pages && old.pages.length > 0) {
              old.pages[old.pages.length - 1] = [
                ...old.pages[old.pages.length - 1],
                optimisticMessage,
              ];
            }
            return old;
          },
        );

        // Return context with the optimistic todo
        return { optimisticMessage };
      },
      onSuccess: (result, variables, context) => {
        if (patientsFeed.isNewSMS) {
          notification.showSuccess('Message was sent succesfully');
          patientsFeed.setSelectedPatient({
            id: targetNumber(),
            phone_no: targetNumber(),
          });
        }

        queryClient.setQueryData(['patient-chat', targetNumber()], (old) => {
          if (old && old.pages && old.pages.length > 0) {
            old.pages[old.pages.length - 1] = old.pages[
              old.pages.length - 1
            ].map((message) => {
              if (message.id === variables.ref) {
                message.id = result.uuid;
                message.uuid = result.uuid;
                message.status = 'queued';
              }
              return message;
            });
          }
          return old;
        });

        if (scrollbars.current) scrollbars.current?.scrollToBottom();
        if (patientsFeed.isNewSMS) {
          refetch();
          patientsFeed.setIsNewSMS(false);
        }
      },
      onError: (error, variables, context) => {
        // Remove optimistic todo from the todos list
        queryClient.setQueryData(['patient-chat', targetNumber()], (old) => {
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

  const NoMessageText = (
    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <div className="p-3">
        <NoMessagesIcon />
      </div>
      <div className={styles.noMessageText}>No messages yet</div>
    </div>
  );

  const NoSelectedMessageText = (
    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <div className="p-3">
        <NoMessagesIcon />
      </div>
      <div className={styles.noMessageText}>
        Select a Patient to View Their Messages
      </div>
    </div>
  );

  const submitChat = ({ patients, scrollbars }) =>
    async function onChatSubmit(values, props) {
      const chatText = values.chat.trim();
      props.setFieldValue('chat', '');
      if (chatText.length === 0) return;
      postMessageMutation.mutate({
        message: chatText,
        toDid: targetNumber(),
        ref: uuidv4(),
      });
    };

  return (
    <div className={styles.chatContainer}>
      <div
        className={
          Object.keys(selectedPatient).length > 0 || patientsFeed.isNewSMS
            ? styles.titleContainer
            : ''
        }
      >
        <div className={styles.titleText}>
          {patientsFeed.isNewSMS ? (
            <PhoneNumberInput />
          ) : (
            selectedPatient.displayName ||
            (selectedPatient.phone_no ? (
              PhoneNumber(selectedPatient.phone_no).getNumber('national')
            ) : (!data ||
                data.pages.length === 0 ||
                data.pages[0].length === 0) &&
              !isFetching &&
              !selectedPatient.phone_no ? (
              selectedPatient.email
            ) : !selectedPatient.phone_no ? (
              <div className="d-flex flex-row py-3">
                <Skeleton
                  variant="rect"
                  width={200}
                  height={14}
                  className="me-4"
                />
                <Skeleton variant="rect" width={100} height={14} />
              </div>
            ) : null)
          )}
        </div>

        {/* TODO: Do not delete, temporarily commented for future use */}
        {/* <div className={styles.searchBoxContainer}>
                    <SearchIcon className={styles.searchBoxIcon} />
                    <InputBase
                        className={styles.searchText}
                        placeholder="Start typing to search..."
                    />
                </div> */}
      </div>

      {patientsFeed.selectedPatient ? (
        <div className={styles.chatListContainer}>
          {
            // patientsFeed.isNewSMS ? (
            //   NoMessageText
            // ) :
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
              {selectedPatient.phone_no ? (
                <div className={styles.chatList}>
                  {isFetchingPreviousPage && (
                    <span>
                      Loading...{' '}
                      <CircularProgress
                        className={styles.chatSendingIndicator}
                      />
                    </span>
                  )}
                  {['loading', 'idle'].includes(status) ? (
                    <PatientChatSkeleton />
                  ) : status === 'error' ? (
                    <p>Error {error.message}</p>
                  ) : data && data.pages ? (
                    data.pages.map((group, i) => (
                      <React.Fragment key={i}>
                        {group.length > 0 &&
                          patientChats
                            .formattedMessages(
                              group,
                              group.length !== patientsFeed.NUM_RECORDS,
                            )
                            .map((chat, i) => {
                              return (
                                <IntelligentMessage key={i} chats={chat} />
                              );
                            })}
                      </React.Fragment>
                    ))
                  ) : (
                    NoMessageText
                  )}
                </div>
              ) : (
                NoMessageText
              )}
            </Scrollbars>
          }
        </div>
      ) : (
        NoSelectedMessageText
      )}

      {((patientsFeed.selectedPatient && patientsFeed.selectedPatient.id) ||
        patientsFeed.newSMSPhoneNumber) && (
        <InputBox
          ref={inputBoxRef}
          onSubmit={submitChat({ patients: patientsFeed, scrollbars })}
          shouldDisable={selectedPatient.phone_no === null}
          canText={selectedPatient.can_text !== 0}
          isEmoji={false}
        />
      )}
    </div>
  );
});

export const IntelligentMessage = observer(({ chats }) => {
  const { patientsFeed, utils, authentication, users } = useStores();
  const authToken = useAuthToken();
  const { timezone } = authentication.user || {};
  const patient =
    patientsFeed.selectedPatient !== null ? patientsFeed.selectedPatient : {};

  if (chats[0].type === 'DATE')
    return (
      <Divider>
        {moment.utc(chats[0].date).tz(timezone).format('dddd, MMMM Do')}
      </Divider>
    );
  switch (chats[0].direction) {
    case 'IN': {
      let subTitle = `${patient.firstname} ${patient.lastname}`;
      if (patient.is_patient === 0) {
        let phone = PhoneNumber(patient.phone_no);
        subTitle = `${phone ? phone.getNumber('national') : patient.phone_no}`;
      }
      subTitle += `, ${moment
        .utc(chats[0].datetime)
        .tz(timezone)
        .format('LT')}`;
      const userImg = utils.prepareMediaUrl({
        uuid: patient.display_image,
        authToken,
      });
      const messageAvatar = (
        <Avatar
          src={userImg}
          id={parseInt(patient.user_id)}
          firstName={patient.firstname}
          lastName={patient.lastname}
        />
      );
      return (
        <OtherMessageCollection
          messages={chats}
          subtitle={subTitle}
          avatar={messageAvatar}
        />
      );
    }
    case 'OUT': {
      const patient = toJS(
        users.getUserByUserId({ userId: chats[0].username }),
      );
      if (patient) {
        const subTitle = (
          <>
            {patient.username},{' '}
            {moment.utc(chats[0].datetime).tz(timezone).format('LT')}
            {chats[0].status === 'sending' ? (
              <CircularProgress className={styles.chatSendingIndicator} />
            ) : null}
          </>
        );
        const userImg = utils.prepareMediaUrl({
          uuid: patient.display_image,
          authToken,
        });
        const messageAvatar = (
          <Avatar
            src={userImg}
            id={patient.user_id}
            firstName={patient.username}
            mobileNo={patient.mobile_no}
          />
        );

        return (
          <MyMessageCollection
            messages={chats}
            subtitle={subTitle}
            avatar={messageAvatar}
          />
        );
      } else {
        const subTitle = (
          <>
            KASPER, {moment.utc(chats[0].datetime).tz(timezone).format('LT')}
            {chats[0].status === 'sending' ? (
              <CircularProgress className={styles.chatSendingIndicator} />
            ) : null}
          </>
        );
        const messageAvatar = <Avatar src={KasperImg} />;

        return (
          <MyMessageCollection
            messages={chats}
            subtitle={subTitle}
            avatar={messageAvatar}
          />
        );
      }
    }
    default:
      return null;
  }
});

export default PatientChat;
