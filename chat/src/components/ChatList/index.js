import React, { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Scrollbars } from "react-custom-scrollbars";
import styled from "styled-components";
import RefreshIcon from "@material-ui/icons/Refresh";
import { useQueryClient } from "react-query";
import ChatItem from "./ChatItem";
import ChatHeader from "./ChatHeader";
import { ArchiveBack } from "./ArchiveBack";
import ChatItemLoading from "./ChatItemLoading";
import { useStores } from "hooks/useStores";
import { useOfficeChatState } from "hooks/useOfficeChatState";
import UnreadMessagesIcon from "assets/images/unread-messages.svg";
import ArchiveItem from "./ArchiveItem";
import styles from "./index.module.css";

const StyledChatList = styled.div`
  .patient-badge [class^="MuiBadge-badge-"] {
    background: #ff0000;
    border: 0.4px solid #0d2145;
    box-sizing: border-box;
    border-radius: 3px;
  }
`;

const ChatItems = ({
  mappedChannels,
  channels,
  users,
  user,
  setSelectedChannel,
  selectedChannel,
}) => {
  const isSelect = (channelId) =>
    selectedChannel && channelId == selectedChannel.id;

  return mappedChannels.map((channel) => {
    const { id, members, properties } = channel;
    const { pinned } = properties || {};
    const isSelectedChannel = isSelect(id);
    return (
      <ChatItem
        channels={channels}
        pin={pinned}
        users={users}
        key={id}
        channel={{
          ...channel,
          members: members?.length > 1 ? members : [],
        }}
        currentUser={user}
        setSelectedChannel={setSelectedChannel}
        isSelectedChannel={isSelectedChannel}
      />
    );
  });
};

const useStyles = makeStyles((theme) => ({
  root: { backgroundColor: "#ffffff" },
}));

const ChatList = ({
  setOpen,
  setOpenGroup,
  channels,
  users,
  selectedChannel,
  setSelectedChannel,
  isFetchingChannel,
  setShowArchiveItems,
  showArchiveItems,
}) => {
  const {
    authentication: { user },
  } = useStores();
  const classes = useStyles();
  const [channelsRows, setChannelsRows] = useState([]);
  const {
    channels: { archive },
  } = useOfficeChatState();
  const scrollbarsRef = useRef();

  useEffect(() => {
    const newChannels = showArchiveItems && archive.length ? archive : channels;
    setChannelsRows(newChannels);
  }, [channels, showArchiveItems]);

  const unableShowArchiveItems =
    !!archive.length && !showArchiveItems && !isFetchingChannel;

  return (
    <StyledChatList>
      <Box
        height="calc(100vh - 64px)"
        className={classes.root}
        style={{
          display: "flex",
          flexFlow: "column",
        }}
      >
        {!!archive.length && showArchiveItems ? (
          <ArchiveBack setShowArchiveItems={setShowArchiveItems} />
        ) : (
          <ChatHeader
            setOpen={setOpen}
            setChannelsRows={setChannelsRows}
            channels={channels}
            setOpenGroup={setOpenGroup}
          />
        )}
        <Scrollbars
          ref={scrollbarsRef}
          style={{ height: "calc(100vh - 64px)" }}
          renderTrackHorizontal={(props) => <div {...props} />}
          renderThumbVertical={({ style, ...props }) => (
            <div
              {...props}
              style={{
                ...style,
                backgroundColor: "#BBC1CD",
                borderRadius: "4px",
                cursor: "pointer",
                opacity: 0.5,
              }}
            />
          )}
        >
          {unableShowArchiveItems && (
            <ArchiveItem
              archiveChannels={archive}
              setShowArchiveItems={setShowArchiveItems}
            />
          )}
          {channelsRows.length > 0 && !isFetchingChannel ? (
            <ChatItems
              mappedChannels={channelsRows}
              channels={channels}
              users={users}
              user={user}
              setSelectedChannel={setSelectedChannel}
              selectedChannel={selectedChannel}
            />
          ) : isFetchingChannel ? (
            [...Array(5)].map((_, i) => (
              <ChatItemLoading variant="rect" height={70} key={i} />
            ))
          ) : (
            <NoMsgPlaceholder />
          )}
        </Scrollbars>
      </Box>
    </StyledChatList>
  );
};

const NoMsgPlaceholder = () => {
  const { patientsFeed } = useStores();
  const queryClient = useQueryClient();

  const handleRefreshBtnClick = async () => {
    patientsFeed.refetchPatientFeed();
    await queryClient.refetchQueries([
      "patient-chat",
      patientsFeed.selectedPatient.phone_no,
    ]);
    patientsFeed.setPendingUnseenSms(false);
  };

  return (
    <div className="text-center pt-5">
      {patientsFeed.smsUnseenOnly ? (
        patientsFeed.pendingUnseenSms ? (
          <>
            <RefreshIcon
              style={{
                height: "2rem",
                width: "2rem",
                marginBottom: "1rem",
                color: "#cccccc",
              }}
              onClick={handleRefreshBtnClick}
            />
            <div style={{ color: "#cccccc", padding: "0 1rem" }}>
              Click to refresh unread messages or disable filter
            </div>
          </>
        ) : (
          <>
            <UnreadMessagesIcon
              style={{ height: "2rem", width: "2rem", marginBottom: "1rem" }}
            />
            <div style={{ color: "#cccccc" }}>No unread messages!</div>
          </>
        )
      ) : (
        <>
          <UnreadMessagesIcon
            style={{ height: "2rem", width: "2rem", marginBottom: "1rem" }}
          />
          <div style={{ color: "#cccccc" }}>No messages found!</div>
        </>
      )}
    </div>
  );
};

export default observer(ChatList);
