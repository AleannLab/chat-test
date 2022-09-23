import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { format } from 'date-fns';
import { first } from 'lodash';
import { useAuthToken } from 'hooks/useAuthToken';
import { Grid } from '@material-ui/core';
import { MessageReply } from 'components/ChatMessengers/MessageReply';
import { MessageOptions } from 'components/ChatMessengers/MessageOptions';
import Avatar from 'components/Avatar';
import { useStores } from 'hooks/useStores';
import Reaction from '../Reaction';
import ProfileImage from 'assets/images/profile-2.svg';
import styles from './index.module.css';
import { MessengersButtons } from 'components/ChatMessengers/MessengersButtons';

const OtherMessageCollection = observer(
  ({
    users,
    message,
    message: {
      reactions,
      user: { displayName },
    },
    channel,
    setReplayedMessage,
    avatar,
  }) => {
    const { kittyOfficeChat, utils, authentication } = useStores();
    const authToken = useAuthToken();
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
      setReplayedMessage(message);
      setOpenMessageActions(false);
      handleClick(event);
    };

    const onMessageEmojiSelect = async (emoji) => {
      const emojiString = emoji.shortcodes;
      await kittyOfficeChat.reactToMessage(emojiString, message);
      setAnchorEl(null);
    };

    const setRead = async () => {
      const status = await kittyOfficeChat.readMessage(message);
    };
    useEffect(() => {
      if (message.channelId === channel.id) {
        setRead();
      }
    }, [message]);

    const [firstName, lastName] = displayName.split(' ');
    // const isOwnAvatar = message.user.displayPictureUrl.slice(-4) === 'user';

    const currentUser = users.find(
      (member) => member.email === message.user.name,
    );
    const { display_image: userUuid, user_id } = currentUser;
    const imgUrl = utils.prepareMediaUrl({ uuid: userUuid, authToken });

    return (
      <div className={styles.messageRow}>
        <div className={styles.messageContent}>
          <Grid container style={{ display: 'flex' }}>
            <Grid
              item
              className="d-flex align-items-end"
              style={{ justifyContent: 'center', paddingBottom: '1.6rem' }}
            >
              <Avatar
                firstName={firstName}
                lastName={lastName}
                src={imgUrl}
                id={user_id || ''}
              />
            </Grid>
            <Grid item xs={11} style={{ padding: ' 0px 14px' }}>
              <div className={styles.messageTime}>
                <>
                  {message.user.displayName || 'username'},{' '}
                  {format(new Date(message.createdTime), 'h:mm a')}
                </>
              </div>
              <>
                <div key={message.id} className={styles.messageTextWrapper}>
                  <div className={styles.messageText}>
                    {message.nestedLevel && <MessageReply message={message} />}
                    <span>{message.body}</span>
                  </div>
                  <div className={styles.messageMessengersButtons}>
                    <MessengersButtons
                      handleOpenEmojisPicker={handleOpenEmojisPicker}
                      handleOpenMessageActions={handleOpenMessageActions}
                    />
                  </div>
                </div>

                <div className={styles.reactionsWrapper}>
                  {reactions &&
                    reactions.map((reaction, i) => {
                      return (
                        <Reaction
                          key={i}
                          reaction={reaction}
                          message={message}
                        />
                      );
                    })}
                </div>
              </>
              <MessageOptions
                anchorEl={anchorEl}
                open={open}
                handleClose={handleClose}
                openEmojisPicker={openEmojisPicker}
                onMessageEmojiSelect={onMessageEmojiSelect}
                openMessageActions={openMessageActions}
                handleMenuItem={handleMenuItem}
              />
            </Grid>
          </Grid>
        </div>
      </div>
    );
  },
);

export default OtherMessageCollection;
