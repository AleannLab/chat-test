import React, { useEffect, useState, useRef } from 'react';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useStores } from 'hooks/useStores';
import ProgressBar from 'components/ProgressBar';
import { ReactComponent as UploadComplete } from 'assets/images/audio-upload-complete.svg';
import { ReactComponent as UploadCancel } from 'assets/images/audio-upload-cancel.svg';
import { ReactComponent as CloudUpload } from 'assets/images/cloud-upload-pink.svg';
import styles from './index.module.css';
import TextInputField from 'components/Core/Formik/TextInputField';
import { useQueryClient } from 'react-query';

let uploadedAudio = null;

const UploadHoldMusic = ({ Id, handleClose }) => {
  const QueryClient = useQueryClient();
  const [file, setFile] = useState('');
  const [inProgressFile, setInProgressFile] = useState('');
  const [entered, setEntered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [percentageDone, setPercentageDone] = useState(0);
  const fileRef = useRef(null);
  const { customGreetings, notification } = useStores();
  const greetingType = customGreetings;
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

  const initialValues = {
    file_name: file ? file.name.split('.')[0] : '',
  };

  const validationSchema = Yup.object({
    file_name: Yup.string()
      .max(50, 'Must be 50 characters or less')
      .required('File name is required'),
  });

  const handleSave = (fileName, completeFileName) => {
    setIsSaving(true);
    greetingType
      .uploadGreeting(completeFileName, file)
      .then((response) => {
        console.log(
          '🚀 ~ file: index.js ~ line 127 ~ .then ~ response',
          response,
        );
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
                .addGreeting(fileName, response.uuid, Id)
                .then(() => {
                  notification.showSuccess('File was uploaded successfully');
                  setIsSaving(false);
                  setFile('');
                  QueryClient.invalidateQueries('getGreetings');
                  handleClose();
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
    if (initialValues.file_name) {
      const currentFileExtension = file.name
        .split('.')
        [file.name.split('.').length - 1].toLowerCase();
      const completeFileName =
        initialValues.file_name + '.' + currentFileExtension;
      handleSave(initialValues.file_name, completeFileName);
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
                <div className="mt-3">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                  >
                    {({ isSubmitting }) => (
                      <Form>
                        <TextInputField
                          maxLength={50}
                          fieldLabel="Greeting name"
                          fieldName="file_name"
                          type="text"
                          placeholder="Enter greeting name"
                          disabled={isSubmitting}
                          required
                        />
                      </Form>
                    )}
                  </Formik>
                </div>
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
      <div className="mt-5 d-flex justify-content-between w-100">
        <Button
          className="me-auto primary-btn"
          variant="outlined"
          color="primary"
          onClick={() => handleClose()}
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
