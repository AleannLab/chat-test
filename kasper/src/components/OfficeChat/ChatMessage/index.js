import React, { memo } from 'react';
import { useAuthToken } from 'hooks/useAuthToken';
import { useStores } from 'hooks/useStores';
import Avatar from 'components/Avatar';
import OtherMessage from '../OtherMessage';
import MyMessage from '../MyMessage';

const ChatMessage = ({
  message,
  message: { user },
  setReplayedMessage,
  channel,
  users,
}) => {
  const { utils, authentication } = useStores();
  const authToken = useAuthToken();

  if (user.name == authentication.user.email) {
    const userImg = utils.prepareMediaUrl({
      uuid: authentication.user.display_image,
      authToken,
    });

    const [fistName, lastName] = authentication.user.username.split(' ');

    const messageAvatar = (
      <Avatar
        src={userImg}
        id={authentication.user.user_id}
        firstName={fistName}
        lastName={lastName}
        mobileNo={authentication.user.phone_no}
      />
    );

    return <MyMessage message={message} avatar={messageAvatar} />;
  } else {
    const otherUserImg = utils.prepareMediaUrl({
      uuid: authentication.user.display_image,
      authToken,
    });
    const messageAvatar = (
      <Avatar
        src={otherUserImg}
        id={user.id}
        firstName={user.displayName}
        mobileNo={authentication.user.phone_no}
      />
    );
    return (
      <OtherMessage
        users={users}
        setReplayedMessage={setReplayedMessage}
        message={message}
        avatar={messageAvatar}
        channel={channel}
      />
    );
  }
};

export default memo(ChatMessage);
