import React, { useEffect, useRef } from 'react';
import { IconButton, InputBase } from '@material-ui/core';
import CloseRounded from '@material-ui/icons/CloseRounded';
import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';
import { isEmpty } from 'lodash';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import Avatar from 'components/Avatar';
import { Channel } from '../Channel';
import styles from './index.module.css';

const ButtonBack = ({ handleBack }) => {
  return (
    <div className={styles.archiveBackContainer} onClick={handleBack}>
      <ArrowBack />
      <span className={styles.archiveBackBack}>Back</span>
    </div>
  );
};

const Search = ({ searchParticipants }) => {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef?.current?.focus();
  }, []);
  return (
    <div className={styles.containerSearch}>
      <div className={styles.wrapperSearch}>
        <IconButton className={styles.buttonIconSearch}>
          <SearchIcon className={styles.iconSearch} />
        </IconButton>
        <InputBase
          placeholder="Search..."
          inputRef={inputRef}
          fullWidth
          onChange={searchParticipants}
        />
      </div>
    </div>
  );
};

const HeaderSendMember = ({ selectParticipant, selectedChannel, users }) => {
  return (
    <div>
      <Channel
        participant={selectParticipant}
        isSelect={true}
        channel={selectedChannel}
        width={'30px'}
        height={'30px'}
        className={styles.nameMember}
        isShowUnderText={true}
        users={users}
      />
    </div>
  );
};

const PopUpChatHeader = ({
  selectParticipant,
  handleRemoveChat,
  searchParticipants,
  saveChat,
  selectedChannel,
  users,
  showArchiveItems,
  setShowArchiveItems,
}) => {
  const { utils, authentication } = useStores();
  const authToken = useAuthToken();
  const isSelectChannel = !isEmpty(selectedChannel);
  const userImg = utils.prepareMediaUrl({
    uuid: authentication.user.display_image,
    authToken,
  });

  const handleBack = () => {
    setShowArchiveItems(false);
  };
  return (
    <div className={styles.chatWrapperHeader}>
      <div className={styles.chatContainerHeader}>
        <div className={styles.containerTitle}>
          {showArchiveItems && !isSelectChannel ? (
            <span className={styles.archiveBackTitle}>Archived Groups</span>
          ) : isSelectChannel ? (
            <HeaderSendMember
              selectParticipant={selectParticipant}
              selectedChannel={selectedChannel}
              users={users}
            />
          ) : (
            <div className={styles.containerTitleMessenger}>
              <Avatar
                src={userImg}
                id={authentication.user.user_id}
                firstName={authentication.user.username}
                mobileNo={authentication.user.phone_no}
                width={'30px'}
                height={'30px'}
              />
              <h4 className={styles.titleMessenger}>Office Chat</h4>
            </div>
          )}
        </div>
        <div className={styles.wrapperButtonHeader}>
          {isSelectChannel && (
            <IconButton
              onClick={saveChat}
              className={clsx(styles.chatIconClose, styles.lineIcon)}
            ></IconButton>
          )}
          {showArchiveItems && !isSelectChannel ? (
            <ButtonBack handleBack={handleBack} />
          ) : (
            <IconButton
              className={styles.chatIconClose}
              onClick={handleRemoveChat}
            >
              <CloseRounded />
            </IconButton>
          )}
        </div>
      </div>
      {!isSelectChannel && <Search searchParticipants={searchParticipants} />}
    </div>
  );
};

export { PopUpChatHeader };
