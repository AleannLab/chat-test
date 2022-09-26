import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from 'react-query';
import { isEmpty } from 'lodash';
import { useStores } from 'hooks/useStores';
import OfficeChat from '../OfficeChat';
import { BubbleButton } from '../PopUpChat/BubbleButton';
import { useAuthToken } from 'hooks/useAuthToken';
import { useOfficeChatDispatch } from 'hooks/useOfficeChatDispatch';
import { useOfficeChatState } from 'hooks/useOfficeChatState';
import { setQuantityUnreadMessages } from 'helpers/setQuantityUnreadMessages';
import { isEqual } from 'helpers/isEqual';
import { getUserIds } from 'helpers/getUserIds';
import { getResultCreateRequests } from 'helpers/getResultCreateRequests';

const TypesChat = ({
  nameChat,
  setChannels,
  channels,
  selectedChannel,
  setCurrentChatSession,
  setSelectedChannel,
  cleanChatSession,
  setIsFetchingChannel,
  isFetchingChannel,
  channelsRows,
}) => {
  const {
    kittyOfficeChat,
    authentication: {
      user: { email },
    },
    users,
    utils,
    users: usersStore,
  } = useStores();
  const { data: activeUsers = [] } = useQuery(['fetchActiveUsers'], () =>
    users?.fetchActiveUsersQuery(),
  );
  const { setCountUnreadChannel, setIncreaseUnreadCountMessage } =
    useOfficeChatDispatch();
  const [changeData, setChangeData] = useState({});
  const [messages, setMessages] = useState([]);
  const isSelectChannel = !isEmpty(selectedChannel);
  const authToken = useAuthToken();
  const isChangeData = isEmpty(changeData);
  const OFFICE_GROUPE_NAME = 'Office Group';
  const setUnreadCountMessage = (channel) => {
    if (channel) {
      setQuantityUnreadMessages(
        channel,
        kittyOfficeChat,
        setCountUnreadChannel,
      );
    }
  };

  const setUnreadChannels = async () => {
    const unreadChannels = await kittyOfficeChat.getUnreadChannels();
    unreadChannels.forEach((channel) => {
      setUnreadCountMessage(channel);
    });
  };

  const callNotification = async (notification) => {
    const POSITION_IN_ARRAY = {
      FIRST: -1,
      LAST_FIRST: 1,
      WITHOUT_CHANGES: 0,
    };
    const POPUP_CHAT = 'popup-chat';
    if (notification) {
      const { channel } = notification;
      const { id } = channel;
      const newChannels = [...channelsRows.current];
      if (nameChat === POPUP_CHAT) {
        setIncreaseUnreadCountMessage(id);
      }
      newChannels.sort((firstChannel, lastChannel) =>
        firstChannel.id === id
          ? POSITION_IN_ARRAY.FIRST
          : lastChannel.id === id
          ? POSITION_IN_ARRAY.LAST_FIRST
          : POSITION_IN_ARRAY.WITHOUT_CHANGES,
      );
      setChangeData(notification);
      setChannels(newChannels, email);
    }
  };
  const onReceivedMessage = (message) => {
    setMessages((old) =>
      old.some((m) => m.id === message.id) ? old : [message, ...old],
    );
  };

  const onChannelUpdated = (channel) => {
    const newChannels = channelsRows.current.map((item) =>
      item.id === channel.id ? channel : item,
    );
    setChannels(newChannels, email);
  };

  const onMessageReactionAdded = (message) => {
    setMessages((old) =>
      old.map((item) => (item.id === message.id ? message : item)),
    );
  };

  const onMessageReactionRemoved = (message) => {
    setMessages((old) =>
      old.map((item) => (item.id === message.id ? message : item)),
    );
  };

  const onMessageRead = (message) => {
    setMessages((old) =>
      old.map((item) => (item.id === message.id ? message : item)),
    );
  };
  const createChatSession = async () => {
    cleanChatSession();
    if (isSelectChannel) {
      const result = await kittyOfficeChat.createChatSession({
        channel: selectedChannel,
        onReceivedMessage,
        onMessageRead,
        onChannelUpdated,
        onMessageReactionAdded,
        onMessageReactionRemoved,
      });
      setCurrentChatSession(result.session);
    }
  };

  // const createUserToOfficeGroupChannel = ({ email, username }) => {

  // };

  const addMissingMembersToOfficeGroupChannel = async (userChannels) => {
    const channelId = userChannels.find(
      (channel) => channel.displayName === OFFICE_GROUPE_NAME,
    ).id;

    const addUser = [];
    const createUser = [];

    const result = await kittyOfficeChat.listChannelMembers(
      channelId,
      0,
      activeUsers?.length,
    );
    const members = result.data._embedded ? result.data._embedded.users : [];
    for (const user of activeUsers) {
      if (members.every((member) => member.name !== user?.email)) {
        createUser.push(
          kittyOfficeChat.createUser(user?.email, user?.username),
        );
        addUser.push(
          kittyOfficeChat.addGroupChannelMember(channelId, {
            username: user?.email,
          }),
        );
        await Promise.all(addUser);
        await Promise.all(createUser);
      }
    }
  };

  const getCreateUser = ({ username, displayName }) => {
    return kittyOfficeChat.createUser(username, displayName);
  };

  const getCreateMessageChannel = async ({ username }) => {
    const TYPE_CHAT_DIRECT = 'DIRECT';
    const members = [{ username: email }, { username }];
    return await kittyOfficeChat
      .createMessageChannel(TYPE_CHAT_DIRECT, members)
      .then((res) => res.channel);
  };

  const getUpdateUserDisplayPicture = (
    { displayImage },
    index,
    creatingUsers,
  ) => {
    const imgUrl = utils.prepareMediaUrl({
      uuid: displayImage,
      authToken,
    });
    return kittyOfficeChat.updateUserDisplayPicture(
      creatingUsers[index].data.id,
      imgUrl,
      200,
    );
  };

  const addEmptyChatsChannel = async (userChannels) => {
    const currentUser = { username: email };
    const alreadyCreatedChats = userChannels
      .filter((channel) => channel.members)
      .map(
        (channel) =>
          channel.members.find((member) => member.name !== email)?.name,
      );

    alreadyCreatedChats.push(currentUser.username);
    const missingUsers = activeUsers
      .filter((user) => !alreadyCreatedChats.includes(user?.email))
      .map((user) => {
        return {
          username: user?.email,
          displayName: user?.username,
          displayImage: user.display_image,
        };
      });
    console.log('add', missingUsers);
    if (!missingUsers.length) {
      return { sussed: true, result: [] };
    }
    const newCreateUsers = await getResultCreateRequests(
      missingUsers,
      getCreateUser,
    );
    const newCreateMessageChannel = await getResultCreateRequests(
      missingUsers,
      getCreateMessageChannel,
    );
    await getResultCreateRequests(
      missingUsers,
      getUpdateUserDisplayPicture,
      newCreateUsers,
    );
    if (newCreateMessageChannel.length) {
      return { sussed: true, result: newCreateMessageChannel };
    }
  };

  const fetchUserChannels = async () => {
    setIsFetchingChannel(true);
    const isEmpty = channelsRows.current.length === 0;
    const userChannels = isEmpty
      ? await kittyOfficeChat.getChannels()
      : channelsRows.current;
    if (isEmpty) {
      await kittyOfficeChat.listChannels(0, 999);
      setUnreadChannels();
      setChannels(userChannels, email);
      const resultAdded = await addEmptyChatsChannel(userChannels);
      if (resultAdded?.sussed) {
        setChannels([...userChannels, ...resultAdded.result], email);
        setIsFetchingChannel(false);
      }
    }
    if (
      userChannels.some((channel) => channel.displayName === OFFICE_GROUPE_NAME)
    ) {
      addMissingMembersToOfficeGroupChannel(userChannels);
    } else {
      createOfficeGroupChannel();
    }
  };

  //TODO create default Office Group.
  const createOfficeGroupChannel = async () => {
    const members = [
      { username: email },
      ...activeUsers.map((user) => {
        return { username: user?.email };
      }),
    ];

    //TODO found out who moderators. By default all members are moderators.
    const moderators = [
      { username: email },
      ...activeUsers.map((user) => {
        return { username: user?.email };
      }),
    ];

    const result = await kittyOfficeChat.createGroupChannel(
      'PUBLIC',
      'Office Group',
    );

    if (result.status) {
      let resultAdded, resultAddedModerators;

      for (const user of activeUsers) {
        await kittyOfficeChat.createUser(user?.email, user?.username);
      }
      for (const member of members) {
        resultAdded = await kittyOfficeChat.addGroupChannelMember(
          result.data.id,
          member,
        );
      }

      for (const moderator of moderators) {
        resultAddedModerators = await kittyOfficeChat.addGroupChannelModerator(
          result.data.id,
          moderator,
        );
      }

      if (resultAdded.status && resultAddedModerators.status) {
        const newChannel = await kittyOfficeChat.getChannel(result.data.id);
        setSelectedChannel(newChannel.channel);
        setChannels([newChannel.channel, ...channelsRows.current], email);
      }
    }
  };

  const checkNewSelectChannel = () => {
    const findNewSelectChannel =
      channelsRows.current.find(({ id }) => id === selectedChannel.id) || {};
    if (!isEqual(findNewSelectChannel, selectedChannel)) {
      setSelectedChannel(findNewSelectChannel);
    }
  };

  const onSend = (message, membersAll, users) => {
    const userIds = getUserIds(membersAll, users);
    usersStore.sendNotification(message, userIds);
  };

  useEffect(() => {
    if (activeUsers.length) {
      fetchUserChannels();
    }
  }, [activeUsers.length]);

  useEffect(() => {
    if (isSelectChannel) {
      checkNewSelectChannel();
    }
  }, [channels]);

  useEffect(() => {
    if (isSelectChannel) {
      createChatSession();
    }
  }, [selectedChannel]);

  useEffect(() => {
    if (isChangeData) {
      kittyOfficeChat.listerChange(callNotification);
    }
  }, []);
  switch (nameChat) {
    case 'office-chat':
      return (
        <OfficeChat
          onSend={onSend}
          setMessages={setMessages}
          messages={messages}
          channels={channels}
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          users={activeUsers}
          isFetchingChannel={isFetchingChannel}
        />
      );
    case 'popup-chat':
      return (
        <BubbleButton
          onSend={onSend}
          setMessages={setMessages}
          messages={messages}
          channels={channels}
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          users={activeUsers}
          cleanChatSession={cleanChatSession}
        />
      );
    default:
      return null;
  }
};

const ContainerChat = ({ nameChat, session }) => {
  const {
    kittyOfficeChat,
    authentication: {
      user: { email },
    },
  } = useStores();
  const channelsRows = useRef([]);
  const { setChannels } = useOfficeChatDispatch();
  const {
    channels: { regular, allChannels },
  } = useOfficeChatState();
  const [selectedChannel, setSelectedChannel] = useState({});
  const [currentChatSession, setCurrentChatSession] = useState({});
  const [isFetchingChannel, setIsFetchingChannel] = useState(true);
  const setUserSession = async () => {
    kittyOfficeChat.onJoinedChannel((data) => {
      const newChannels = channelsRows.current.some(({ id }) => id === data.id)
        ? channelsRows.current
        : [data, ...channelsRows.current];
      setChannels(newChannels, email);
    });

    kittyOfficeChat.onLeftChannel(({ id: idData }) => {
      const newChannels = channelsRows.current.filter(
        ({ id }) => id !== idData,
      );
      setChannels(newChannels, email);
      setSelectedChannel((selectedChannel) =>
        idData === selectedChannel?.id ? null : selectedChannel,
      );
    });
  };
  const cleanChatSession = () => {
    setCurrentChatSession((currentChatSession) => {
      const isCurrentChatSession = !isEmpty(currentChatSession);
      return isCurrentChatSession
        ? currentChatSession.end()
        : currentChatSession;
    });
  };
  useEffect(() => {
    if (session) {
      setUserSession();
    }
    return () => cleanChatSession();
  }, [session]);

  useEffect(() => {
    channelsRows.current = allChannels;
  }, [allChannels]);

  if (!session) {
    return null;
  }
  return (
    <TypesChat
      nameChat={nameChat}
      setChannels={setChannels}
      channels={regular}
      selectedChannel={selectedChannel}
      setCurrentChatSession={setCurrentChatSession}
      setIsFetchingChannel={setIsFetchingChannel}
      setSelectedChannel={setSelectedChannel}
      cleanChatSession={cleanChatSession}
      currentChatSession={currentChatSession}
      isFetchingChannel={isFetchingChannel}
      channelsRows={channelsRows}
    />
  );
};

export default ContainerChat;
