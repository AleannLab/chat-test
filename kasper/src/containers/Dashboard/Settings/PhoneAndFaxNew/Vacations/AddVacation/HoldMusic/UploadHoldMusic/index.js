import React, { useEffect, useState, useRef } from 'react';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { useStores } from 'hooks/useStores';
import ProgressBar from 'components/ProgressBar';
import { ReactComponent as UploadComplete } from 'assets/images/audio-upload-complete.svg';
import { ReactComponent as UploadCancel } from 'assets/images/audio-upload-cancel.svg';
import { ReactComponent as CloudUpload } from 'assets/images/cloud-upload-pink.svg';
import styles from './index.module.css';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import { ReactComponent as DeleteIcon } from 'assets/images/custom-delete.svg';

let uploadedAudio = null;

const UploadedItem = ({ toggleAudio, file, isAudioPlayed, setFile }) => {
  return (
    <div className={styles.audioContainer}>
      <span className="d-flex align-items-center ">
        {!isAudioPlayed && (
          <PlayCircleFilledIcon
            className={styles.playPause}
            onClick={toggleAudio}
          />
        )}
        {isAudioPlayed && (
          <PauseCircleFilledIcon
            className={styles.playPause}
            onClick={toggleAudio}
          />
        )}

        <div className={styles.ivr_name}>{file?.name?.split('.')[0]}</div>
      </span>
      <span className={styles.icon_sec_audio}>
        <DeleteIcon
          style={{ fill: '#999999', cursor: 'pointer' }}
          onClick={() => setFile('')}
        />
      </span>
    </div>
  );
};

const UploadHoldMusic = ({ handleClose }) => {
  const [file, setFile] = useState('');
  const [inProgressFile, setInProgressFile] = useState('');
  const [isAudioPlayed, setIsAudioPlayed] = useState(false);
  const [entered, setEntered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [percentageDone, setPercentageDone] = useState(0);
  const fileRef = useRef(null);
  const { vacationGreeting } = useStores();
  const greetingType = vacationGreeting;
  const { notification } = useStores();
  const validExtensions = ['wav', 'wma', 'mp3'];

  useEffect(() => {
    if (uploading) {
      let percentage = 0;
      const timer = setInterval(() => {
        percentage += 10;
        setPercentageDone(percentage);
        if (percentage === 100) {
          setFile(inProgressFile);
          setUploading(false);
        }
      }, 100);
      return () => {
        clearInterval(timer);
      };
    }
  }, [uploading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEntered(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEntered(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEntered(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentFileExtension = e.dataTransfer.files[0].name
      .split('.')
      [e.dataTransfer.files[0].name.split('.').length - 1].toLowerCase();

    let valid = validExtensions.includes(currentFileExtension);
    if (valid) {
      setUploading(true);
      setInProgressFile(e.dataTransfer.files[0]);
    } else if (!valid) {
      notification.showError('File type is invalid');
      setEntered(false);
    }
    if (valid && percentageDone === 100) {
      setUploading(false);
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileRef.current.click();
  };

  const toggleAudio = () => {
    if (!isAudioPlayed) {
      uploadedAudio?.play();
      setIsAudioPlayed(true);
    } else {
      uploadedAudio?.pause();
      setIsAudioPlayed(false);
    }
  };
  const handleLocalFileUpload = (e) => {
    const uploadedFile = document.getElementById('src');
    uploadedFile?.setAttribute('src', URL.createObjectURL(e.target.files[0]));
    uploadedAudio = document.getElementById('audio');
    uploadedAudio?.load();

    const currentFileExtension = e.target.files[0].name
      .split('.')
      [e.target.files[0].name.split('.').length - 1].toLowerCase();

    let valid = validExtensions.includes(currentFileExtension);
    if (valid) {
      setInProgressFile(e.target.files[0]);
      setUploading(true);
      if (percentageDone === 100) {
        setFile(e.target.files[0]);
      }
    } else {
      notification.showError('File type is invalid');
    }
  };

  const handleSave = (fileName, completeFileName) => {
    setIsSaving(true);
    greetingType
      .uploadGreeting(completeFileName, file)
      .then((response) => {
        if (response.url) {
          axios({
            method: 'PUT',
            url: response.url,
            headers: {
              'content-type': file?.type,
            },
            processData: false,
            data: file,
          })
            .then(() => {
              greetingType
                .addGreeting(fileName, response.uuid)
                .then(() => {
                  notification.showSuccess('File was uploaded successfully');
                  setIsSaving(false);
                  setFile('');

                  setTimeout(() => {
                    notification.hideNotification();
                  }, 2500);
                })
                .catch((e) => {
                  setIsSaving(false);
                  setFile('');

                  notification.showError(
                    'An unexpected error occurred while attempting to save the file',
                  );
                  setTimeout(() => {
                    notification.hideNotification();
                  }, 3000);
                });
            })
            .catch((e) => {
              setIsSaving(false);
              setFile('');
              notification.showError(
                'An unexpected error occurred while attempting to save the file',
              );
              setTimeout(() => {
                notification.hideNotification();
              }, 3000);
            });
        }
      })
      .catch((e) => {
        setIsSaving(false);
        setFile('');
        notification.showError(
          'An unexpected error occurred while attempting to save the file',
        );
        setTimeout(() => {
          notification.hideNotification();
        }, 3000);
      });
  };

  const handleUploadCancel = () => {
    setFile('');
    setPercentageDone(0);
    setInProgressFile('');
    setEntered(false);
    setUploading(false);
  };

  const handleSubmitForm = (e) => {
    if (file) {
      handleSave(file?.name?.split('.')[0], file?.name);
    }
  };

  return (
    <>
      <div className={styles.profileImageRootContainer}>
        <div
          className={styles.container}
          onDrop={(e) => handleDrop(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDragEnter={(e) => handleDragEnter(e)}
          onDragLeave={(e) => handleDragLeave(e)}
        >
          {file ? (
            <div style={{ width: '100%' }}>
              <div className={styles.successfulUpload}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileUploaded}>File uploaded</span>
              </div>
              <div className={styles.progressBarCheckbox}>
                <ProgressBar value={100} />
                <UploadComplete className={styles.checkbox} />
              </div>
              {percentageDone === 100 && (
                <UploadedItem
                  toggleAudio={toggleAudio}
                  file={file}
                  isAudioPlayed={isAudioPlayed}
                  setFile={setFile}
                />
              )}
            </div>
          ) : uploading ? (
            <div style={{ width: '100%' }}>
              <div className={styles.successfulUpload}>
                <span className={styles.fileName}>{inProgressFile.name}</span>
                <span className={styles.fileUploaded}>
                  Uploading {percentageDone}%
                </span>
              </div>
              <div className={styles.progressBarCheckbox}>
                <ProgressBar value={percentageDone} />
                <UploadCancel
                  className={styles.cancel}
                  onClick={handleUploadCancel}
                />
              </div>
            </div>
          ) : (
            <div>
              <div
                className={
                  entered
                    ? styles.uploadContainerFilled
                    : styles.uploadContainerEmpty
                }
              >
                <CloudUpload />
                <input
                  ref={fileRef}
                  className={styles.hidden}
                  type="file"
                  onChange={handleLocalFileUpload}
                  accept=".wav, .wma, .mp3"
                />
                <p className={styles.uploadInstructions}>
                  <span className={styles.highlight} onClick={handleClick}>
                    Add file
                  </span>{' '}
                  or drop file here (.wav, .wma, .mp3)
                </p>
              </div>
            </div>
          )}
        </div>
        <audio id="audio" controls className={styles.customAudio}>
          <source src="" id="src" />
        </audio>
      </div>
      <div className={styles.flexButtons}>
        <Button
          className="me-auto primary-btn"
          variant="outlined"
          color="primary"
          onClick={handleClose}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="secondary-btn"
          variant="contained"
          color="secondary"
          style={{ width: 'auto' }}
          disabled={isSaving}
          onClick={() => handleSubmitForm()}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </>
  );
};

export default UploadHoldMusic;
