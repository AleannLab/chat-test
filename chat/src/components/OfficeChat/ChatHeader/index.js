import React, { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { useQuery } from "react-query";
import { ChannelAvatar } from "components/ChannelAvatar";
import MenuIcon from "assets/images/menu.svg";
import PinIcon from "assets/images/pin.svg";
import SettingIcon from "assets/images/setting.svg";
import UnarchiveIcon from "assets/images/unarchive.svg";
import Trash from "assets/images/delete.svg";
import { useStores } from "hooks/useStores";
import GroupSettingsModal from "containers/Dashboard/OfficeChat/GroupSettingsModal";
import AddUsersToGroupChatModal from "containers/Dashboard/OfficeChat/AddUsersToGroupChatModal";
import SelectGroupAdminsModal from "containers/Dashboard/OfficeChat/SelectGroupAdminsModal";
import styles from "./index.module.css";

const ChatMenu = ({
  anchorEl,
  handleClose,
  open,
  selectedChannel,
  setSelectedChannel,
  setGroupName,
}) => {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [openSettings, setOpenedSettings] = useState(false);
  const [openAddNewParticipantsModal, setOpenAddNewParticipantsModal] =
    useState(false);
  const [openAddNewModeratorsModal, setOpenAddNewModeratorsModal] =
    useState(false);
  const [membersAll, setMembers] = useState({
    members: [],
    moderators: [],
    participants: [],
  });
  const {
    kittyOfficeChat,
    users,
    authentication,
    authentication: { user },
  } = useStores();
  const { id, type } = selectedChannel;
  const { members, participants } = membersAll;
  const { data } = useQuery(["fetchActiveUsers"], () =>
    users.fetchActiveUsersQuery()
  );
  const activeUsers = useMemo(() => {
    const membersId = members.map(({ name }) => name);
    return data?.filter(({ email }) => !membersId.includes(email));
  }, [data, members]);

  const allUsers = useMemo(() => {
    const membersId = members.map(({ name }) => name);
    return data;
  }, [data]);

  const activeParticipants = useMemo(() => {
    const membersId = participants.map(({ name }) => name);
    return data?.filter(({ email }) => membersId.includes(email));
  }, [data, participants]);

  const handleOpenAddNewParticipantsModal = () => {
    setOpenAddNewParticipantsModal(true);
    setOpenedSettings(false);
  };

  const handleOpenAddNewModeratorsModal = () => {
    setOpenAddNewModeratorsModal(true);
    setOpenedSettings(false);
  };

  const handleCloseAddNewParticipantsModal = () => {
    setOpenAddNewParticipantsModal(false);
    setOpenedSettings(true);
  };

  const handleCloseAddNewModeratorsModal = () => {
    setOpenAddNewModeratorsModal(false);
    setOpenedSettings(true);
  };

  const setMembersChannel = async () => {
    const members =
      (await kittyOfficeChat
        .memberListGetter(selectedChannel)
        .then((res) => res?.filter(({ name }) => name !== user.email))) || [];
    const idModerators =
      (await kittyOfficeChat
        .getListModerators(id)
        .then((res) => res.data._embedded?.users.map(({ id }) => id))) || [];
    const participants = members.filter(({ id }) => !idModerators.includes(id));
    const moderators = members.filter(({ id }) => idModerators.includes(id));
    setMembers({
      members,
      moderators,
      participants,
    });
  };

  const handleSetSelectedModeratorsForGroup = async (moderatorsArray) => {
    const requests = moderatorsArray.map((member) =>
      kittyOfficeChat.addGroupChannelModerator(id, {
        username: member.email,
      })
    );
    await Promise.all(requests);
    setSelectedMembers([]);
    setMembersChannel();
  };

  const handleSetSelectedUsersForGroup = async (usersArray) => {
    const requests = usersArray.map((member) =>
      kittyOfficeChat.addGroupChannelMember(id, {
        username: member.email,
      })
    );
    await Promise.all(requests);
    setSelectedMembers([]);
    setMembersChannel();
  };

  const onHandleDeleting = () => {
    handleClose();
    kittyOfficeChat.deleteChannel(selectedChannel);
    setSelectedChannel(null);
  };

  const onHandleArchive = async () => {
    handleClose();
    const hiddenResult = await kittyOfficeChat.hideGroup(id, user.email);
    if (selectedChannel?.properties?.pinned && hiddenResult.status === 200) {
      onHandleUnpin();
    }
    setSelectedChannel(null);
  };

  const onHandleUnarchive = () => {
    handleClose();
    kittyOfficeChat.unhideGroup(id, user.email);
    setSelectedChannel(null);
  };

  const onHandlePin = async () => {
    handleClose();
    const pinResult = await kittyOfficeChat.pinChannel(id, user.email);
    if (selectedChannel?.properties?.hideStatus && pinResult.status === 200) {
      onHandleUnarchive();
    }
    setSelectedChannel(null);
  };

  const onHandleOpenModalSetting = () => {
    setOpenedSettings(true);
  };

  const onHandleUnpin = () => {
    handleClose();
    kittyOfficeChat.unpinChannel(id, user.email);
    setSelectedChannel(null);
  };

  const deleteMember = async (memberId) => {
    await kittyOfficeChat.deleteMemberWithGroupChannel(id, memberId);
    setMembersChannel();
  };

  const updateName = async (name) => {
    const {
      data: { displayName },
    } = await kittyOfficeChat.updateDisplayNameChannelGroup(id, name);
    setGroupName(displayName);
  };

  useEffect(() => {
    if (open) {
      setMembersChannel();
    }
  }, [selectedChannel, open]);

  const isPrivate = ["PRIVATE", "PUBLIC"].includes(type);
  const hidden = selectedChannel.properties?.hideStatus;
  const pinned = selectedChannel.properties?.pinned;

  return (
    <Menu id="long-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
      <GroupSettingsModal
        handleCloseUpperMenu={handleClose}
        usersAll={allUsers}
        selectedChannel={selectedChannel}
        open={openSettings}
        deleteMember={deleteMember}
        handleOpenAddNewParticipantsModal={handleOpenAddNewParticipantsModal}
        handleOpenAddNewModeratorsModal={handleOpenAddNewModeratorsModal}
        updateName={updateName}
        setOpen={setOpenedSettings}
        members={membersAll}
      />
      <AddUsersToGroupChatModal
        isNewGroup={false}
        open={openAddNewParticipantsModal}
        handleCloseAddNewMemberModal={handleCloseAddNewParticipantsModal}
        users={activeUsers}
        setUsers={handleSetSelectedUsersForGroup}
        setSelected={setSelectedMembers}
        selected={selectedMembers}
      />
      <SelectGroupAdminsModal
        isNewGroup={false}
        open={openAddNewModeratorsModal}
        handleCloseAddNewModeratorsModal={handleCloseAddNewModeratorsModal}
        users={activeParticipants}
        setUsers={handleSetSelectedModeratorsForGroup}
        setSelected={setSelectedMembers}
      />
      {isPrivate && (
        <MenuItem
          className={styles.menuItem}
          onClick={onHandleOpenModalSetting}
        >
          <SettingIcon />
          Settings
        </MenuItem>
      )}
      <MenuItem
        className={styles.menuItem}
        onClick={pinned?.includes(user.email) ? onHandleUnpin : onHandlePin}
      >
        <PinIcon />
        {pinned?.includes(user.email) ? "Unpin" : "Pin"}
      </MenuItem>
      {isPrivate && (
        <MenuItem
          className={styles.menuItem}
          onClick={
            hidden?.includes(user.email) ? onHandleUnarchive : onHandleArchive
          }
        >
          <UnarchiveIcon />
          {hidden?.includes(user.email) ? "Unarchive Group" : "Archive Group"}
        </MenuItem>
      )}
      <MenuItem className={styles.menuItem} onClick={onHandleDeleting}>
        <Trash />
        Delete
      </MenuItem>
    </Menu>
  );
};

const ChatHeader = ({
  users,
  selectedChannel,
  setSelectedChannel,
  channels,
}) => {
  const {
    authentication: { user },
  } = useStores();
  const { type, displayName, members = [] } = selectedChannel;
  const otherData = members.find((item) => item.name !== user.email);
  const { displayName: otherName = "", presence = {} } = otherData || {};
  const [groupName, setGroupName] = useState("");
  const { online = true } = presence;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [openedSettings, setOpenedSettings] = useState(false);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setOpenedSettings(false);
    setAnchorEl(null);
  };

  useEffect(() => {
    const name = displayName ? displayName : otherName;
    setGroupName(name);
  }, [displayName, otherName]);
  return (
    <div className={styles.titleContainer}>
      <div className={styles.otherContainer}>
        <div className={styles.avatar}>
          <ChannelAvatar
            users={users}
            channel={selectedChannel}
            width={"30px"}
            height={"30px"}
          />
        </div>
        <div className={styles.infoOther}>
          <h2 className={styles.otherName}>{groupName}</h2>
          {type === "DIRECT" && (
            <span
              className={clsx(
                styles.otherIsOnline,
                online ? styles.otherOnline : styles.otherOffline
              )}
            >
              {online ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>
      <div className={styles.searchBoxContainer}>
        {/* <IconButton className={styles.iconButton}>
          <SearchIcon className={styles.searchBoxIcon} />
        </IconButton> */}
        {/* {(selectedChannel.type === 'PRIVATE' ||
          selectedChannel.type === 'DIRECT') && ( */}
        <IconButton className={styles.iconButton} onClick={handleClick}>
          <MenuIcon />
        </IconButton>
        {/* )} */}
        <ChatMenu
          anchorEl={anchorEl}
          handleClose={handleClose}
          selectedChannel={selectedChannel}
          groupName={groupName}
          setGroupName={setGroupName}
          setSelectedChannel={setSelectedChannel}
          channels={channels}
          open={open}
        />
      </div>
    </div>
  );
};

export { ChatHeader, ChatMenu };
