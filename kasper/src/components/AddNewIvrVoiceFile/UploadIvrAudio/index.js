import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useStores } from 'hooks/useStores';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import ProgressBar from 'components/ProgressBar';
import { ReactComponent as UploadComplete } from 'assets/images/audio-upload-complete.svg';
import { ReactComponent as UploadCancel } from 'assets/images/audio-upload-cancel.svg';
import { ReactComponent as CloudUpload } from 'assets/images/cloud-upload-pink.svg';
import styles from './index.module.css';
import TextInputField from 'components/Core/Formik/TextInputField';
import axios from 'axios';

const UploadIvrAudio = (
  { greetingType, handleClose, handleSaving, onAudioFileSelection },
  ref,
) => {
  const fileRef = useRef(null);
  const submitButtonRef = useRef(null);
  const [file, setFile] = useState('');
  const [inProgressFile, setInProgressFile] = useState('');
  const [entered, setEntered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [percentageDone, setPercentageDone] = useState(0);
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

  const handleClick = () => fileRef.current.click();

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
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEntered(true);
  };
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

  const initialValues = {
    file_name: file ? file.name.split('.')[0] : '',
  };

  const validationSchema = Yup.object({
    file_name: Yup.string()
      .max(50, 'Must be 50 characters or less')
      .required('File name is required'),
  });

  const handleSave = (fileName, completeFileName) => {
    handleSaving(true);
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
                  setTimeout(() => {
                    notification.hideNotification();
                    onAudioFileSelection({
                      name: fileName,
                      uuid: response.uuid,
                    });
                    handleClose();
                  }, 2500);
                })
                .catch((e) => {
                  console.error(e);
                  notification.showError(
                    'An unexpected error occurred while attempting to save the file',
                  );
                  setTimeout(() => {
                    notification.hideNotification();
                    handleClose();
                  }, 3000);
                });
            })
            .catch((e) => {
              console.error(e);
              notification.showError(
                'An unexpected error occurred while attempting to save the file',
              );
              setTimeout(() => {
                notification.hideNotification();
                handleClose();
              }, 3000);
            });
        }
      })
      .catch((e) => {
        console.error(e);
        notification.showError(
          'An unexpected error occurred while attempting to save the file',
        );
        setEntered(false);
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

  const handleLocalFileUpload = (e) => {
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

  const handleSubmitForm = (e) => {
    if (e.file_name) {
      const currentFileExtension = file.name
        .split('.')
        [file.name.split('.').length - 1].toLowerCase();
      const completeFileName = e.file_name + '.' + currentFileExtension;
      handleSave(e.file_name, completeFileName);
    }
  };

  useImperativeHandle(ref, () => ({
    triggerSubmit() {
      if (file) submitButtonRef.current.click();
    },
  }));

  return file ? (
    <div style={{ width: '100%' }}>
      <p className={styles.subtitle}>File should be WAV, WMA, MP3.</p>
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
            onSubmit={handleSubmitForm}
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
                <button
                  ref={submitButtonRef}
                  type="submit"
                  className={styles.hidden}
                ></button>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  ) : uploading ? (
    <div style={{ width: '100%' }}>
      <p className={styles.subtitle}>File should be WAV, WMA, MP3.</p>
      <div className={styles.successfulUpload}>
        <span className={styles.fileName}>{inProgressFile.name}</span>
        <span className={styles.fileUploaded}>Uploading {percentageDone}%</span>
      </div>
      <div className={styles.progressBarCheckbox}>
        <ProgressBar value={percentageDone} />
        <UploadCancel className={styles.cancel} onClick={handleUploadCancel} />
      </div>
    </div>
  ) : (
    <div
      onClick={handleClick}
      className={
        entered ? styles.uploadContainerFilled : styles.uploadContainerEmpty
      }
      onDrop={(e) => handleDrop(e)}
      onDragOver={(e) => handleDragOver(e)}
      onDragEnter={(e) => handleDragEnter(e)}
      onDragLeave={(e) => handleDragLeave(e)}
    >
      <CloudUpload height={20} width={20} />
      <center className="ms-2">
        <input
          className={styles.hidden}
          type="file"
          accept=".wav, .wma, .mp3"
          onChange={handleLocalFileUpload}
          ref={fileRef}
        />
        <div className={styles.uploadInstructions}>
          <span className={styles.highlight}>Add File</span> or drop it here
          (wav, wma, mp3)
        </div>
      </center>
    </div>
  );
};

export default forwardRef(UploadIvrAudio);
