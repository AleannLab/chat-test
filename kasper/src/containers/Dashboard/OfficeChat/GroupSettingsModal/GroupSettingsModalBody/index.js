import React, { useState, useRef, useEffect } from 'react';
import {
  DialogContent,
  OutlinedInput,
  InputLabel,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  ButtonBase,
} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import clsx from 'clsx';
import { useAuthToken } from 'hooks/useAuthToken';
import { useStores } from 'hooks/useStores';
import { getGroupNewAvatar } from 'helpers/getGroupNewAvatar';
import Avatar from 'components/Avatar';
import styles from './index.module.css';
import { UploadPhoto } from '../../AddNewGroupChatModal';

const EditButton = ({ isEdit, toggleIsEdit, saveNewName }) => {
  const handleClick = () => {
    saveNewName();
    toggleIsEdit();
  };
  return (
    <div className={styles.buttonContainer}>
      {isEdit ? (
        <>
          <IconButton className={styles.iconButton} onClick={handleClick}>
            <CheckIcon className={styles.checkedButton} />
          </IconButton>
          <IconButton className={styles.iconButton} onClick={toggleIsEdit}>
            <ClearIcon className={styles.crossButton} />
          </IconButton>
        </>
      ) : (
        <IconButton className={styles.iconButton} onClick={toggleIsEdit}>
          <EditOutlinedIcon className={styles.editIcon} />
        </IconButton>
      )}
    </div>
  );
};

const ButtonSeeMore = ({ onClick }) => {
  return (
    <ButtonBase onClick={onClick} className={styles.buttonMore}>
      See more
    </ButtonBase>
  );
};

const ButtonAddPeople = () => {
  return (
    <div className={styles.containerButtonAdd}>
      <IconButton className={clsx(styles.iconButton, styles.addButtonPeople)}>
        <Add className={styles.iconAdd} />
      </IconButton>
      <span>Add people</span>
    </div>
  );
};

const InputNameGroup = ({ handleInput, groupName, saveNewName }) => {
  const [isEdit, setIsEdit] = useState(false);
  const toggleIsEdit = () => {
    setIsEdit(!isEdit);
  };
  return (
    <div className={styles.inputBlockContainer}>
      <div className={styles.inputContainer}>
        <InputLabel className={styles.labelGroupName}>
          NAME
          <OutlinedInput
            fullWidth
            classes={{
              input: styles.inputGroupName,
              notchedOutline: styles.wrapInputGroupName,
            }}
            onChange={handleInput}
            value={groupName}
            disabled={!isEdit}
          />
        </InputLabel>
        <EditButton
          isEdit={isEdit}
          toggleIsEdit={toggleIsEdit}
          saveNewName={saveNewName}
        />
      </div>
    </div>
  );
};

const TableRows = ({ members, deleteMember, users }) => {
  const { utils } = useStores();
  const authToken = useAuthToken();
  return (
    <>
      {members.map((member) => {
        const { displayName, user_id, id } = member;
        const userUuid = utils.getUserUuid(member, users);
        const imgUrl = utils.prepareMediaUrl({ uuid: userUuid, authToken });

        const [firstName, lastName] =
          utils.getFirstLastSeparateName(displayName);

        return (
          <>
            <TableRow className={styles.tableRow}>
              <TableCell
                className={clsx(styles.tableCell, styles.tableCellName)}
              >
                <Avatar
                  firstName={firstName}
                  lastName={lastName}
                  src={imgUrl}
                  id={user_id}
                />
                {displayName}
              </TableCell>
              <TableCell className={styles.tableCell}>
                <IconButton
                  className={styles.iconButton}
                  onClick={() => deleteMember(id)}
                >
                  <Delete className={styles.iconDelete} />
                </IconButton>
              </TableCell>
            </TableRow>
          </>
        );
      })}
    </>
  );
};

const TableUsers = ({
  users,
  members,
  title,
  quantity,
  handleOpenAddNewMembersModal,
  deleteMember,
}) => {
  const [isMore, setIsMore] = useState(false);
  const MAX_SHOW_MEMBERS = 3;
  const toggleIsMore = () => {
    setIsMore(!isMore);
  };
  return (
    <div className={styles.wrapperTable}>
      <h3 className={styles.titleTable}>
        {title}
        <span className={styles.containerTitleQuantity}>
          (<span className={styles.titleQuantity}>{quantity}</span>)
        </span>
      </h3>
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                className={clsx(styles.tableCell, styles.tableCellButtonAdd)}
                onClick={handleOpenAddNewMembersModal}
              >
                <ButtonAddPeople />
              </TableCell>
            </TableRow>
            <TableRows
              users={users}
              members={members.slice(0, MAX_SHOW_MEMBERS)}
              deleteMember={deleteMember}
            />
            {isMore && (
              <TableRows
                users={users}
                members={members.slice(MAX_SHOW_MEMBERS)}
                deleteMember={deleteMember}
              />
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {quantity > MAX_SHOW_MEMBERS && <ButtonSeeMore onClick={toggleIsMore} />}
    </div>
  );
};

const Participants = ({
  quantity,
  users,
  participants,
  handleOpenAddNewParticipantsModal,
  deleteMember,
}) => {
  return (
    <TableUsers
      users={users}
      title={'Participants'}
      deleteMember={deleteMember}
      quantity={quantity}
      members={participants}
      handleOpenAddNewMembersModal={handleOpenAddNewParticipantsModal}
    />
  );
};

const Admins = ({
  quantity,
  users,
  moderators,
  deleteMember,
  handleOpenAddNewModeratorsModal,
}) => {
  return (
    <TableUsers
      users={users}
      title={'Admins'}
      deleteMember={deleteMember}
      quantity={quantity}
      members={moderators}
      handleOpenAddNewMembersModal={handleOpenAddNewModeratorsModal}
    />
  );
};

const GroupSettingsModalBody = ({
  usersAll,
  handleInput,
  groupName,
  saveNewName,
  deleteMember,
  members,
  handleOpenAddNewParticipantsModal,
  handleOpenAddNewModeratorsModal,
  id,
  uuid,
  isPublic,
}) => {
  const { utils, kittyOfficeChat, notification } = useStores();
  const authToken = useAuthToken();
  const userImg = utils.prepareMediaUrl({
    uuid,
    authToken,
  });
  const { moderators, participants } = members;
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [groupAvatar, setGroupAvatar] = useState({
    url: null,
    name: 'avatar',
  });
  const handleClick = () => {
    fileRef.current.click();
  };

  const handleLocalFileUpload = async (e) => {
    const [file] = e.target.files;
    setUploading(true);
    const newUserImg = await getGroupNewAvatar(
      file,
      kittyOfficeChat,
      id,
      utils,
      authToken,
      notification,
    );
    setUploading(false);
    setGroupAvatar({
      ...file,
      name: file.name,
      url: newUserImg,
    });
    notification.showSuccess('Applying changes...');
    setTimeout(() => {
      notification.hideNotification();
    }, 2500);
  };

  useEffect(() => {
    setGroupAvatar((dataAvatar) => {
      dataAvatar.url = userImg;
      return { ...dataAvatar };
    });
  }, [userImg]);

  return (
    <DialogContent className={styles.dialogContent}>
      <UploadPhoto
        handleLocalFileUpload={handleLocalFileUpload}
        handleClick={handleClick}
        uploading={uploading}
        setUploading={setUploading}
        groupAvatar={groupAvatar}
        setGroupAvatar={setGroupAvatar}
        fileRef={fileRef}
      />

      {!isPublic && (
        <div className={styles.container}>
          <InputNameGroup
            handleInput={handleInput}
            groupName={groupName}
            saveNewName={saveNewName}
          />
          <Participants
            users={usersAll}
            quantity={participants.length}
            participants={participants}
            deleteMember={deleteMember}
            handleOpenAddNewParticipantsModal={
              handleOpenAddNewParticipantsModal
            }
          />
          <Admins
            users={usersAll}
            quantity={moderators.length}
            moderators={moderators}
            deleteMember={deleteMember}
            handleOpenAddNewModeratorsModal={handleOpenAddNewModeratorsModal}
          />
        </div>
      )}
    </DialogContent>
  );
};

export { GroupSettingsModalBody };
