import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './index.module.css';
import { MessageReply } from 'components/ChatMessengers/MessageReply';
import { MessengersButtons } from 'components/ChatMessengers/MessengersButtons';
import { MessageOptions } from 'components/ChatMessengers/MessageOptions';
import Reaction from 'components/OfficeChat/Reaction';
import { useStores } from 'hooks/useStores';

const ContainerReactions = ({ reactions, memberMessage, isUser }) => {
  return (
    <div
      className={clsx(styles.reactionsWrapper, {
        [styles.reactionsUser]: isUser,
      })}
    >
      {reactions.map((reaction, i) => {
        return <Reaction key={i} reaction={reaction} message={memberMessage} />;
      })}
    </div>
  );
};

const Message = ({
  message,
  reactions,
  nestedLevel,
  isUser,
  memberMessage,
  setReplayedMessage,
}) => {
  const { kittyOfficeChat } = useStores();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEmojisPicker, setOpenEmojisPicker] = useState(false);
  const [openMessageActions, setOpenMessageActions] = useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleOpenEmojisPicker = (event) => {
    handleClick(event);
    setOpenEmojisPicker(true);
  };
  const handleOpenMessageActions = (event) => {
    handleClick(event);
    setOpenMessageActions(true);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpenEmojisPicker(false);
    setOpenMessageActions(false);
  };
  const handleMenuItem = (event) => {
    setReplayedMessage(memberMessage);
    setOpenMessageActions(false);
    handleClick(event);
  };

  const onMessageEmojiSelect = async (emoji) => {
    const emojiString = emoji.shortcodes;
    await kittyOfficeChat.reactToMessage(emojiString, memberMessage);
    setAnchorEl(null);
  };
  return (
    <div className={styles.messageContainer}>
      <div
        className={clsx(styles.messageWrapper, {
          [styles.messageUser]: isUser,
        })}
      >
        {nestedLevel && <MessageReply message={memberMessage} />}
        <p className={styles.message}>{message}</p>
        {reactions && (
          <ContainerReactions
            reactions={reactions}
            memberMessage={memberMessage}
            isUser={isUser}
          />
        )}
      </div>
      {!isUser && (
        <>
          <MessengersButtons
            handleOpenEmojisPicker={handleOpenEmojisPicker}
            handleOpenMessageActions={handleOpenMessageActions}
          />
          <MessageOptions
            anchorEl={anchorEl}
            open={open}
            handleClose={handleClose}
            openEmojisPicker={openEmojisPicker}
            onMessageEmojiSelect={onMessageEmojiSelect}
            openMessageActions={openMessageActions}
            handleMenuItem={handleMenuItem}
          />
        </>
      )}
    </div>
  );
};

export { Message };
