import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import Skeleton from '@material-ui/lab/Skeleton';
import { Img } from 'react-image';

import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import Loader from 'components/Core/Loader';
import Modal from 'components/Core/Modal';
// This is the image which would be displayed in case the image is available but the user is unable to download it
import TempProfilePlaceholder from 'assets/images/profile.png';
import { ReactComponent as CloudUpload } from 'assets/images/cloud-upload-pink.svg';
import { ReactComponent as DownloadIcon } from 'assets/images/custom-download.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/custom-delete.svg';
import styles from './index.module.css';

const ProfileImage = () => {
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const validExtensions = ['jpg', 'jpeg', 'png'];

  const { authentication, users, notification, utils } = useStores();
  const authToken = useAuthToken();
  const user = authentication.user;

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentFileExtension = e.dataTransfer.files[0].name
      .split('.')
      [e.dataTransfer.files[0].name.split('.').length - 1].toLowerCase();

    let valid = validExtensions.includes(currentFileExtension);
    if (valid) {
      setUploading(true);
      await handleSave(e.dataTransfer.files[0]);
    } else if (!valid) {
      notification.showError('File type is invalid');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    fileRef.current.click();
  };

  const handleLocalFileUpload = async (e) => {
    const currentFileExtension = e.target.files[0].name
      .split('.')
      [e.target.files[0].name.split('.').length - 1].toLowerCase();
    let valid = validExtensions.includes(currentFileExtension);
    if (valid) {
      setUploading(true);
      await handleSave(e.target.files[0]);
      notification.showSuccess('Applying changes...');
      setTimeout(() => {
        notification.hideNotification();
        window.location.reload();
      }, 2500);
    } else {
      notification.showError('File type is invalid');
    }
  };

  const handleSave = async (file) => {
    const { username, user_id } = authentication.user;
    await users.deleteUserImage(username, user_id);
    await authentication.refreshUser();
    try {
      const response = await users.userImageUpload(file, username, user_id);
      if (response.url) {
        axios({
          method: 'PUT',
          url: response.url,
          headers: {
            'content-type': file.type,
          },
          processData: false,
          data: file,
        })
          .then(async () => {
            await authentication.refreshUser().then(() => {
              setUploading(false);
            });
            notification.showSuccess(
              'Profile picture was updated successfully',
            );
            setTimeout(() => {
              notification.hideNotification();
            }, 2500);
          })
          .catch((e) => {
            console.error(e);
            notification.showError(
              'An unexpected error occurred while attempting to fetch the profile picture',
            );
            users.setDisplayImage(TempProfilePlaceholder);
          });
      }
    } catch (e) {
      console.error(e);
      notification.showError(
        'An unexpected error occurred while attempting to upload the profile picture',
      );
    }
  };

  const handleImageDelete = async () => {
    const { username, user_id } = authentication.user;
    try {
      await users.deleteUserImage(username, user_id);
      notification.showSuccess('Profile picture was deleted successfully');
      await authentication.refreshUser();
      setTimeout(() => {
        notification.hideNotification();
        window.location.reload();
      }, 2500);
    } catch (e) {
      console.error(e);
      notification.showError(
        'An unexpected error occurred while attempting to delete the profile picture',
      );
    }
    setIsDeleting(false);
    setOpenConfirmation(false);
  };

  return (
    <div className={styles.profileImageRootContainer}>
      <div
        className={styles.profileImagecontainer}
        onDrop={(e) => handleDrop(e)}
        onDragOver={(e) => handleDragOver(e)}
        onDragEnter={(e) => handleDragEnter(e)}
        onDragLeave={(e) => handleDragLeave(e)}
      >
        {user.display_image ? (
          <div className={styles.avatarContainer}>
            <Img
              key={utils.prepareMediaUrl({
                uuid: user.display_image,
                authToken,
              })}
              alt="Profile Image"
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '15rem',
                maxHeight: '15rem',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
              src={utils.prepareMediaUrl({
                uuid: user.display_image,
                authToken,
              })}
              loader={<Skeleton width="15rem" height="15rem" variant="rect" />}
            />
          </div>
        ) : (
          <div className={styles.uploadContainer}>
            <Loader
              show={uploading && !users.display_image}
              message="Uploading picture"
            >
              <center>
                <CloudUpload />
                <input
                  ref={fileRef}
                  className={styles.hidden}
                  type="file"
                  onChange={handleLocalFileUpload}
                  accept=".jpg, .jpeg, .png"
                />
                <div className={styles.uploadInstructions}>
                  <span className={styles.highlight} onClick={handleClick}>
                    Upload avatar
                  </span>{' '}
                  or drop image here
                </div>
              </center>
            </Loader>
          </div>
        )}
      </div>
      {user.display_image && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={styles.profileImageAction}>
            <input
              ref={fileRef}
              className={styles.hidden}
              type="file"
              onChange={handleLocalFileUpload}
              accept=".jpg, .jpeg, .png"
            />
            <DownloadIcon
              fill="#9A9A9A"
              style={{ cursor: 'pointer' }}
              onClick={handleClick}
            />
            <span
              className={styles.profileImageActionText}
              onClick={handleClick}
            >
              Change Picture
            </span>
          </div>
          <div className={styles.profileImageAction}>
            <DeleteIcon
              fill="#9A9A9A"
              style={{ cursor: 'pointer' }}
              onClick={() => setOpenConfirmation(true)}
            />
            <span
              className={styles.profileImageActionText}
              onClick={() => setOpenConfirmation(true)}
            >
              Delete
            </span>
          </div>
        </div>
      )}
      {openConfirmation && (
        <Modal
          size="sm"
          header="Delete confirmation"
          body={
            <div calssName={styles.confirmationRoot}>
              <p className={styles.confirmationSubtitle}>
                Are you sure you want to delete the profile picture?
              </p>
              <div className="d-flex justify-content-between mt-5">
                <Button
                  className="primary-btn me-auto"
                  variant="outlined"
                  color="primary"
                  disabled={isDeleting}
                  onClick={() => setOpenConfirmation(false)}
                >
                  Cancel
                </Button>

                <Button
                  disabled={isDeleting}
                  className="secondary-btn"
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setIsDeleting(true);
                    handleImageDelete();
                  }}
                >
                  {isDeleting ? 'Deleting' : 'Delete'}
                </Button>
              </div>
            </div>
          }
          onClose={() => setOpenConfirmation(false)}
        />
      )}
    </div>
  );
};

export default observer(ProfileImage);
