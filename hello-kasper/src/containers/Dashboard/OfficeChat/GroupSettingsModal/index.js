import { useState } from 'react';
import { Dialog } from '@material-ui/core';
import { GroupSettingsModalHeader } from './GroupSettingsModalHeader';
import { GroupSettingsModalBody } from './GroupSettingsModalBody';

const GroupSettingsModal = ({
  handleCloseUpperMenu,
  open,
  setOpen,
  selectedChannel,
  handleOpenAddNewParticipantsModal,
  handleOpenAddNewModeratorsModal,
  updateName,
  deleteMember,
  members,
  usersAll,
}) => {
  const {
    displayName,
    type,
    id,
    properties: { uuid },
  } = selectedChannel;
  const isPublic = type === 'PUBLIC';
  const [groupName, setGroupName] = useState(displayName);

  const handleClose = () => {
    handleCloseUpperMenu();
    setOpen(false);
  };

  const handleInput = (e) => {
    setGroupName(e.target.value);
  };

  const saveNewName = () => {
    updateName(groupName);
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      disableBackdropClick
      maxWidth="md"
    >
      <GroupSettingsModalHeader handleClose={handleClose} />
      <GroupSettingsModalBody
        usersAll={usersAll}
        handleOpenAddNewParticipantsModal={handleOpenAddNewParticipantsModal}
        handleOpenAddNewModeratorsModal={handleOpenAddNewModeratorsModal}
        handleInput={handleInput}
        groupName={groupName}
        saveNewName={saveNewName}
        deleteMember={deleteMember}
        members={members}
        id={id}
        uuid={uuid}
        isPublic={isPublic}
      />
    </Dialog>
  );
};

export default GroupSettingsModal;
