import React, { useEffect, useState } from 'react';
import { Card, Typography } from '@material-ui/core';
import { Badge } from '@material-ui/core';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { first } from 'lodash';
import { IconButton } from '@material-ui/core';
import MoreVert from '@material-ui/icons/MoreVert';
import { convertCustomTime } from 'helpers/timezone';
import { ReactComponent as PinnedIcon } from 'assets/images/pin.svg';
import { useStores } from 'hooks/useStores';
import { ChatInformation } from 'components/ChatMessengers/ChatInformation';
import UnseenCounter from 'components/PatientFeed/UnseenCounter/UnseenCounter';
import { UnreadMessages } from 'components/ChatMessengers/UnreadMessages';
import { ChannelAvatar } from 'components/ChannelAvatar';
import { useOfficeChatState } from 'hooks/useOfficeChatState';
import { useOfficeChatDispatch } from 'hooks/useOfficeChatDispatch';
import styles from './index.module.css';
import { ChatMenu } from 'components/OfficeChat/ChatHeader';

const MessageTime = ({ lastReceivedMessage, createdTime }) => {
  return (
    <div className={styles.messageTime}>
      {lastReceivedMessage
        ? convertCustomTime({
            dateTime: lastReceivedMessage.createdTime,
            format: 'hh:mm a',
          })
        : createdTime
        ? convertCustomTime({
            dateTime: createdTime,
            format: 'hh:mm a',
          })
        : 'n/a'}
    </div>
  );
};

const ChatItem = ({
  users,
  isSelectedChannel,
  setSelectedChannel,
  channel,
  pin,
  channels,
  channel: {
    createdTime,
    displayName,
    type,
    id,
    lastReceivedMessage,
    members = [],
  },
}) => {
  const {
    authentication: { user },
  } = useStores();
  const { setResetUnreadCountMessage } = useOfficeChatDispatch();
  const { countUnreadMessageChannels } = useOfficeChatState();
  const countUnreadMessage = countUnreadMessageChannels[id];
  const [otherParticipant, setOtherParticipant] = useState(null);
  const otherData = members.find((item) => item.name !== user.email);
  const [groupName, setGroupName] = useState('');
  const { displayName: otherName = '' } = otherData || {};
  const [hoverOn, setHoverOn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOnClickCard = () => {
    setResetUnreadCountMessage(id);
    setSelectedChannel(channel);
  };

  const handleClick = (event) => {
    setSelectedChannel(channel);
    setResetUnreadCountMessage(id);
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const name = displayName ? displayName : otherName;
    setGroupName(name);
  }, [displayName, otherName]);

  useEffect(() => {
    if (!isSelectedChannel) {
      setHoverOn(false);
    }
  }, [isSelectedChannel]);

  useEffect(() => {
    if (channel) {
      const otherMember = first(
        channel.members.filter((member) => member.name != user.email),
      );
      setOtherParticipant(otherMember);
    }
  }, [channel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Card
        onMouseOver={() => setHoverOn(true)}
        onMouseLeave={() => setHoverOn(false)}
        ref={undefined}
        className={`${isSelectedChannel ? styles.selectedCard : styles.card}`}
        onClick={handleOnClickCard}
      >
        {isSelectedChannel && <div className={styles.rowOnSelected}></div>}
        <div
          className={clsx(
            styles.content,
            isSelectedChannel && styles.selectedContent,
          )}
        >
          <UnseenCounter count={0} />

          <div className={styles.containerAvatar}>
            <Badge
              badgeContent={2}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              className="patient-badge"
              invisible={true} // TODO : KAS-632 - Hide notification icons for unread messages
            >
              {!!countUnreadMessage && (
                <UnreadMessages quantity={countUnreadMessage} />
              )}
              <ChannelAvatar users={users} channel={channel} />
              <ChatInformation
                participant={otherParticipant}
                type={type}
                lastReceivedMessage={lastReceivedMessage}
                users={users}
                classNameOnline={styles.chatInfoOnline}
                classNameAvatar={styles.chatInfoAvatar}
              />
            </Badge>
          </div>

          <div className={styles.cardInformation}>
            <Typography
              variant="body1"
              className={clsx(
                isSelectedChannel
                  ? styles.selectedTypography
                  : styles.Typography,
              )}
            >
              {type == 'DIRECT' && otherParticipant
                ? otherParticipant?.displayName
                : type === 'PUBLIC' || type === 'PRIVATE'
                ? displayName
                : 'UNKNOWN'}
            </Typography>
            <Typography variant="caption" className={styles.subtitle}>
              {lastReceivedMessage ? lastReceivedMessage.body : ''}
            </Typography>
          </div>
          <div className={styles.containerSubtitle}>
            <Typography variant="caption" className={styles.subtitle}>
              {pin?.includes(user.email) && (
                <div className={styles.pin}>
                  <PinnedIcon />
                </div>
              )}
              <IconButton
                className={clsx(
                  styles.iconButtonMore,
                  styles.iconButton,
                  open && isSelectedChannel && styles.visible,
                )}
                onClick={handleClick}
              >
                <MoreVert />
              </IconButton>
              <MessageTime
                lastReceivedMessage={lastReceivedMessage}
                createdTime={createdTime}
              />
            </Typography>
          </div>
        </div>
        <ChatMenu
          anchorEl={anchorEl}
          handleClose={handleClose}
          selectedChannel={channel}
          groupName={groupName}
          setGroupName={setGroupName}
          setSelectedChannel={setSelectedChannel}
          channels={channels}
          open={open}
        />
      </Card>
      <div className={styles.border}></div>
    </>
  );
};

export default observer(ChatItem);
