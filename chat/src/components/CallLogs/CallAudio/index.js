import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import DownloadIcon from "assets/images/download.svg";
import { useStores } from "hooks/useStores";
import React, { useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "./index.css";
import moment from "moment-timezone";
import useLogSeenMutation from "../mutations/useLogSeenMutation";
import { useQuery } from "react-query";
import { useEffect } from "react";

const CallAudio = (props) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const {
    dialer,
    activityLogs,
    authentication: { user },
    notification,
    permissions,
  } = useStores();
  const { mutateAsync: setSeenMutation } = useLogSeenMutation();

  useEffect(() => {
    setError(null);
  }, [props.file]);

  async function AutoDownload() {
    setIsDownloading(true);
    notification.showInfo("Generating file...");
    function FormatTitle() {
      if (props.callType["direction"] == "IN") {
        /* Covers voicemail also */
        return `${props.callType["itemLabel"].replace(/\s+/g, "")}_${moment
          .utc(props.callDate)
          .tz(user.timezone)
          .format("YYYY-MM-DD")}_${props.callNum["from_did"].replace(
          "+1",
          ""
        )}.mp3`;
      } else if (props.callType["direction"] == "OUT") {
        return `${props.callType["itemLabel"].replace(/\s+/g, "")}_${moment
          .utc(props.callDate)
          .tz(user.timezone)
          .format("YYYY-MM-DD")}_${props.callNum["to_did"].replace(
          "+1",
          ""
        )}.mp3`;
      }
    }

    const blob = await fetch(props.file).then((res) => res.blob());
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", FormatTitle());
    document.body.appendChild(link);
    link.click();
    setIsDownloading(false);
  }

  const callRecordingPermissionQuery = useQuery(
    ["userPermissions", user.id],
    () => permissions.getUserPermissions(user.id),
    {
      enabled: !!user.id,
      onError: (err) => {
        notification.showError(err.message);
      },
    }
  );

  const callRecordingPermission = callRecordingPermissionQuery.data?.find(
    (perm) => perm.permission_id === 8
  );

  return (
    <div className="kasper-callaudio__root">
      <Grid container spacing={1}>
        <Grid item xs={6} md={6} lg={6} style={{ marginTop: "10px" }}>
          <Typography
            style={{
              textAlign: "left",
              paddingLeft: "0",
              fontSize: "14px",
              fontFamily: "Montserrat",
              color: "#02122F",
            }}
          >
            {props.recording_type}
          </Typography>
        </Grid>
        <Grid
          item
          xs={6}
          md={6}
          lg={6}
          style={{ marginTop: "10px", textAlign: "right" }}
        >
          <Button
            onClick={AutoDownload}
            variant="outlined"
            color="secondary"
            className="me-2 toolbar-btn"
            size="small"
            startIcon={<DownloadIcon />}
            disabled={
              (!user.record_call && props.recording_type !== "Voicemail"
                ? true
                : !props.file
                ? true
                : callRecordingPermission.enabled === 0 &&
                  props.recording_type !== "Voicemail"
                ? true
                : false) || isDownloading
            }
          >
            <span>Download</span>
          </Button>
        </Grid>
        <Grid
          key={props.file}
          item
          xs={12}
          md={12}
          lg={12}
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
          }}
          disabled={props.file ? false : true}
        >
          {!user.record_call && props.recording_type !== "Voicemail" ? (
            <span>Call recording is disabled by Admin</span>
          ) : callRecordingPermission.enabled === 0 &&
            props.recording_type !== "Voicemail" ? (
            <span>You do not have permissions to view call recordings</span>
          ) : !props.file && user.record_call ? (
            <span>Call recording is not available</span>
          ) : props.file && error ? (
            <span>{error}</span>
          ) : (
            props.file &&
            !error && (
              <AudioPlayer
                className="voicemail-playback"
                src={props.file}
                showJumpControls={false}
                showSkipControls={false}
                onPlayError={() =>
                  setError(
                    "Unable to play recording. Please try to refresh your page."
                  )
                }
                onPlay={() => {
                  if (props.recording_type === "Voicemail") {
                    dialer.triggerEvent(`${props.providerId}_${props.uuid}`);
                    setSeenMutation();
                  }
                }}
                customAdditionalControls={[]}
                customVolumeControls={[]}
              />
            )
          )}
          {/* <audio controls src={props.file} style={{ width: "100%" }} disabled={props.file ? false : true}>
                        Your browser does not support the audio element.
                    </audio> */}
        </Grid>
      </Grid>
    </div>
  );
};

export default CallAudio;
