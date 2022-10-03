import React from 'react';
import clsx from 'clsx';
import { useAuthToken } from 'hooks/useAuthToken';
import Avatar from 'components/Avatar';
import { useStores } from 'hooks/useStores';
import { OnlineParticipant } from 'components/ChatMessengers/OnlineParticipant';

import styles from './index.module.css';

const ChatInformation = ({
  participant,
  type,
  lastReceivedMessage,
  users,
  classNameOnline,
  classNameAvatar,
}) => {
  const { utils } = useStores();
  const { user } = lastReceivedMessage || {};
  const [firstName, lastName] = user?.displayName?.split(' ') || [];
  const authToken = useAuthToken();
  const { display_image, user_id } =
    users.find((x) => x.email === user?.name) || {};
  const imgUrl = utils.prepareMediaUrl({ uuid: display_image, authToken });
  switch (type) {
    case 'DIRECT':
      return (
        <OnlineParticipant
          online={participant?.presence?.online}
          isText={false}
          className={clsx(styles.wrapperChatInformation, classNameOnline)}
        />
      );
    case 'PUBLIC':
    case 'PRIVATE':
      return (
        <>
          {lastReceivedMessage && (
            <div
              className={clsx(
                styles.wrapperChatInformation,
                styles.avatarLastMessage,
                classNameAvatar,
              )}
            >
              <Avatar
                firstName={firstName}
                lastName={lastName}
                src={imgUrl ? imgUrl : ''}
                id={user_id || ''}
                width={'20px'}
                height={'20px'}
              />
            </div>
          )}
        </>
      );
    default:
      return null;
  }
};
export { ChatInformation };
