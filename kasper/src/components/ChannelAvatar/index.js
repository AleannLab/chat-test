import React, { useEffect, useState } from 'react';
import Avatar from 'components/Avatar';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import { getAvatar } from 'helpers/getAvatar';

const ChannelAvatar = ({ users, channel, width, height }) => {
  const {
    authentication: { user },
    utils,
  } = useStores();
  const authToken = useAuthToken();
  const [otherParticipant, setOtherParticipant] = useState(null);
  const { type, id, displayName, members } = channel;
  const isChannel = type === 'PUBLIC' || type === 'PRIVATE';
  const myId =
    channel && type == 'DIRECT' && otherParticipant ? otherParticipant.id : '';
  const [firstName, lastName] =
    channel && type == 'DIRECT' && otherParticipant
      ? otherParticipant.displayName.split(' ')
      : '';
  const { imgUrl, user_id } = getAvatar(channel, user, users, authToken, utils);
  useEffect(() => {
    if (channel) {
      const otherMember = members?.find((member) => member.name !== user.email);
      setOtherParticipant(otherMember);
    }
  }, [members]);
  return (
    <Avatar
      id={isChannel ? id : user_id}
      src={imgUrl}
      firstName={isChannel ? displayName : firstName}
      lastName={lastName}
      mobileNo={''}
      width={width}
      height={height}
      customLetter={isChannel ? 'CHANNEL' : 'KASPER'}
    />
  );
};

export { ChannelAvatar };
