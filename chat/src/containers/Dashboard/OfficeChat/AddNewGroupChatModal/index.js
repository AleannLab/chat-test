import React, { useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  OutlinedInput,
} from "@material-ui/core";
import { PhotoCameraSharp } from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import UploadIcon from "assets/images/upload-file.svg";
import { useAuthToken } from "hooks/useAuthToken";
import { useStores } from "hooks/useStores";
import { getGroupNewAvatar } from "helpers/getGroupNewAvatar";
import LoaderIcon from "assets/images/loader.gif";
import styles from "./index.module.css";

export const UploadPhoto = ({
  handleLocalFileUpload,
  handleClick,
  uploading,
  groupAvatar,
  fileRef,
}) => {
  return (
    <div className={styles.photoContainer}>
      <div className={styles.photoPreview}>
        {groupAvatar && !uploading ? (
          <img className={styles.photoDisplay} src={groupAvatar?.url} />
        ) : (
          <PhotoCameraSharp />
        )}
      </div>
      <label className={styles.uploadPhotoContainer}>
        <input
          ref={fileRef}
          onChange={handleLocalFileUpload}
          type={"file"}
          className={styles.uploadInput}
          accept=".jpg, .jpeg, .png, .svg"
        />
        <UploadIcon
          fill="#9A9A9A"
          style={{ cursor: "pointer" }}
          onClick={handleClick}
        />
        <span>{groupAvatar ? groupAvatar.name : "Upload Photo"}</span>
      </label>
    </div>
  );
};

const AddNewGroupChatModal = ({
  open,
  setOpen,
  setNext,
  groupName,
  setGroupName,
  setResultGroupCreating,
  groupAvatar,
  setGroupAvatar,
}) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { utils, authentication, kittyOfficeChat, notification } = useStores();
  const authToken = useAuthToken();

  const handleClose = () => {
    setGroupName("");
    setGroupAvatar(null);
    setFile(null);
    setOpen(false);
  };

  const handleNextNewGroupChat = () => {
    updateName();
  };

  const handleInput = (e) => {
    setGroupName(e.target.value);
  };

  const handleClick = () => {
    fileRef.current.click();
  };

  const addGroupAvatar = async (id) => {
    if (file) {
      const newUserImg = await getGroupNewAvatar(
        file,
        kittyOfficeChat,
        id,
        utils,
        authToken,
        notification
      );
      setGroupAvatar({
        ...file,
        name: file.name,
        url: newUserImg,
      });
    }
  };

  const updateName = async () => {
    setIsLoading(true);
    const result = await kittyOfficeChat.createGroupChannel(
      "PRIVATE",
      Date.now()
    );
    const { status, data } =
      await kittyOfficeChat.updateDisplayNameChannelGroup(
        result.data.id,
        groupName
      );
    await addGroupAvatar(data.id);
    notification.showSuccess("Applying changes...");
    setTimeout(() => {
      notification.hideNotification();
    }, 2500);
    let resultAdded, resultAddedModerator;
    // Had to be not less than one user at this step
    if (status === 200) {
      resultAdded = await kittyOfficeChat.addGroupChannelMember(data.id, {
        username: authentication.user.email,
      });
      // Had to be not less than one moderator at this step
      if (resultAdded.status === 200) {
        resultAddedModerator = await kittyOfficeChat.addGroupChannelModerator(
          data.id,
          {
            username: authentication.user.email,
          }
        );
      }

      if (resultAddedModerator.status === 200) {
        const newChannel = await kittyOfficeChat.getChannel(data.id);
        setResultGroupCreating(newChannel.channel);
      }
    }

    if (status === 200) {
      setOpen(false);
      setNext(true);
      notification.showSuccess("Group name updated");
    } else {
      notification.showError("Update groupe name error");
    }
    setFile(null);
    setIsLoading(false);
  };

  const handleLocalFileUpload = (e) => {
    const { files } = e.target;
    const [file] = files;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { result } = ev.target;
      setGroupAvatar({
        ...file,
        name: file.name,
        url: result,
      });
    };
    reader.readAsDataURL(...files);
    setFile(file);
  };

  return (
    <>
      <Dialog
        onClose={handleClose}
        open={open}
        disableBackdropClick
        maxWidth="md"
        classes={{
          scrollPaper: styles.scrollPaper,
          paper: styles.dialogPaper,
        }}
      >
        <DialogTitle disableTypography className="p-0">
          <div className="d-flex justify-content-end">
            <IconButton
              disabled={isLoading}
              aria-label="close"
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <div className={styles.titleText}>New Group</div>
        </DialogTitle>
        <DialogContent className={"mx-5 mb-5"}>
          <UploadPhoto
            handleLocalFileUpload={handleLocalFileUpload}
            handleClick={handleClick}
            uploading={uploading}
            setUploading={setUploading}
            groupAvatar={groupAvatar}
            setGroupAvatar={setGroupAvatar}
            fileRef={fileRef}
          />
          <div className={styles.inputBlockContainer}>
            <span>GROUP NAME</span>
            <div className={styles.inputContainer}>
              <OutlinedInput onInput={handleInput} value={groupName} />
            </div>
          </div>
          <DialogActions className="px-0" style={{ marginTop: "40px" }}>
            <Button
              className="primary-btn me-auto"
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className="secondary-btn"
              variant="contained"
              color="secondary"
              onClick={handleNextNewGroupChat}
              disabled={groupName.length === 0 || isLoading}
            >
              {isLoading ? (
                <img className={styles.loader} src={LoaderIcon} alt="loader" />
              ) : (
                "Next"
              )}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewGroupChatModal;
