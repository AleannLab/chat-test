import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import HeadComp from 'components/SEO/HelmetComp';
import Grid from '@material-ui/core/Grid';
import ChatList from 'components/ChatList';
import OfficeChat from 'components/OfficeChat';
import AddNewChatModal from './AddNewChatModal';
import AddNewGroupChatModal from './AddNewGroupChatModal';
import AddUsersToGroupChatModal from './AddUsersToGroupChatModal';
import SelectGroupAdminsModal from './SelectGroupAdminsModal';

const OfficeChatContainer = ({
  onSend,
  channels,
  selectedChannel,
  setSelectedChannel,
  setMessages,
  messages,
  users,
  isFetchingChannel,
}) => {
  const [resultGroupCreating, setResultGroupCreating] = useState(null);
  const [openNewChatModal, setOpenNewChatModal] = useState(false);
  const [openNewGroupChatModal, setOpenNewGroupChatModal] = useState(false);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState([]);
  const [openNextNewGroupChatModal, setOpenNextNewGroupChatModal] =
    useState(false);
  const [openSelectGroupAdminsModal, setOpenSelectGroupAdminsModal] =
    useState(false);
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [showArchiveItems, setShowArchiveItems] = useState(false);
  const handleCloseAddNewMemberModal = () => {
    setOpenNextNewGroupChatModal(false);
  };
  const handleCloseAddNewModeratorsModal = () => {
    setOpenSelectGroupAdminsModal(false);
  };

  const handleSetSelectedUsersForGroup = (usersArray) => {
    setSelectedUsersForGroup(usersArray);
  };

  const handleSetGroupName = (value) => {
    setGroupName(value);
  };
  return (
    <>
      <HeadComp title="Office Chat" />
      <Grid
        item
        width="18%"
        minWidth={250}
        style={{ borderRight: '1px solid #BBC1CD' }}
      >
        <ChatList
          showArchiveItems={showArchiveItems}
          setShowArchiveItems={setShowArchiveItems}
          setOpen={setOpenNewChatModal}
          setOpenGroup={setOpenNewGroupChatModal}
          channels={channels}
          users={users}
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          isFetchingChannel={isFetchingChannel}
        />
      </Grid>
      <Grid
        item
        xs
        style={{
          borderRight: '1px solid #BBC1CD',
          height: '100%',
        }}
      >
        <OfficeChat
          onSend={onSend}
          users={users}
          channels={channels}
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          setMessages={setMessages}
          messages={messages}
        />
      </Grid>
      <AddNewChatModal
        open={openNewChatModal}
        setOpen={setOpenNewChatModal}
        users={users}
        setSelectedChannel={setSelectedChannel}
      />
      <AddNewGroupChatModal
        groupName={groupName}
        setGroupName={handleSetGroupName}
        open={openNewGroupChatModal}
        setOpen={setOpenNewGroupChatModal}
        setNext={setOpenNextNewGroupChatModal}
        result={result}
        setResult={setResult}
        setResultGroupCreating={setResultGroupCreating}
        resultGroupCreating={resultGroupCreating}
        groupAvatar={groupAvatar}
        setGroupAvatar={setGroupAvatar}
      />
      <AddUsersToGroupChatModal
        open={openNextNewGroupChatModal}
        handleCloseAddNewMemberModal={handleCloseAddNewMemberModal}
        setOpenBack={setOpenNewGroupChatModal}
        setOpenNext={setOpenSelectGroupAdminsModal}
        users={users}
        setUsers={handleSetSelectedUsersForGroup}
        setGroupName={handleSetGroupName}
        setSelected={setSelected}
        selected={selected}
        setResultGroupCreating={setResultGroupCreating}
        resultGroupCreating={resultGroupCreating}
        setGroupAvatar={setGroupAvatar}
      />
      <SelectGroupAdminsModal
        setOpen={setOpenSelectGroupAdminsModal}
        open={openSelectGroupAdminsModal}
        handleCloseAddNewModeratorsModal={handleCloseAddNewModeratorsModal}
        setOpenBack={setOpenNextNewGroupChatModal}
        users={selectedUsersForGroup}
        setUsers={handleSetSelectedUsersForGroup}
        setGroupName={handleSetGroupName}
        setSelectedChannel={setSelectedChannel}
        setSelected={setSelected}
        setResultGroupCreating={setResultGroupCreating}
        resultGroupCreating={resultGroupCreating}
        setGroupAvatar={setGroupAvatar}
      />
    </>
  );
};

export default observer(OfficeChatContainer);
