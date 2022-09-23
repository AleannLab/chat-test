import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as MicIcon } from 'assets/images/mic.svg';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import Button from '@material-ui/core/Button';
import AudioPlayer from 'react-h5-audio-player';
import TextInputField from 'components/Core/Formik/TextInputField';
import { useStores } from 'hooks/useStores';
import axios from 'axios';
import 'react-h5-audio-player/lib/styles.css';
import styles from './index.module.css';
import AudioRecorder from 'components/Core/AudioRecorder';
import { useQueryClient } from 'react-query';

const RecordGreeting = ({ handleClose }) => {
  const playerRef = useRef(null);
  const [file, setFile] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const QueryClient = useQueryClient();
  const [createdAudioPlayback, setCreatedAudioPlayback] = useState(false);
  const [audioGreeting, setAudioGreeting] = useState({
    audioBlob: '',
    audioGenerated: '',
    saved: false,
    audioUrl: '',
    audioFile: '',
  });
  const { vacationGreeting, notification } = useStores();
  const greetingType = vacationGreeting;
  const currentFileNameRef = useRef(file ? file.name.split('.')[0] : '');
  useEffect(() => {
    if (audioGreeting.saved) {
      setFile(audioGreeting.audioFile);
    }
  }, [audioGreeting]);

  const initialValues = {
    file_name: file ? file.name.split('.')[0] : '',
  };

  const validationSchema = Yup.object({
    file_name: Yup.string()
      .max(50, 'Must be 50 characters or less')
      .required('File name is required'),
  });

  const handleAudioPlayback = () => {
    if (createdAudioPlayback) {
      playAudio(false);
    } else {
      playAudio(true);
    }
  };

  const playAudio = (status) => {
    if (status) {
      setCreatedAudioPlayback(true);
      playerRef.current.audio.current.play();
      playerRef.current.audio.current.addEventListener('ended', () => {
        setCreatedAudioPlayback(false);
      });
    } else {
      setCreatedAudioPlayback(false);
      playerRef.current.audio.current.pause();
    }
  };

  const handleSubmitForm = (e) => {
    if (initialValues.file_name) {
      const currentFileExtension = file.name
        .split('.')
        [file.name.split('.').length - 1].toLowerCase();
      const completeFileName =
        currentFileNameRef.current?.values?.file_name +
        '.' +
        currentFileExtension;
      handleSave(
        currentFileNameRef.current?.values?.file_name,
        completeFileName,
      );
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
                  QueryClient.invalidateQueries('getGreetings');
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

  const handleStartOver = () => {
    setFile('');
    playAudio(false);
    setCreatedAudioPlayback(false);
    setAudioGreeting({
      audioBlob: '',
      audioGenerated: '',
      saved: false,
      audioFile: '',
    });
  };

  return (
    <>
      <div className={styles.recorderContainer}>
        <div className="d-flex align-items-center justify-content-between">
          <MicIcon className={styles.micIcon} />
          {!file && (
            <AudioRecorder
              outerIsRecording={isRecording}
              setOuterIsRecording={setIsRecording}
              onGenerateAudioURL={setAudioGreeting}
              type={'ivr'}
            />
          )}
          {file && (
            <div className={styles.playerContainer}>
              <AudioPlayer
                src={audioGreeting.audioUrl}
                showJumpControls={false}
                showSkipControls={false}
                ref={playerRef}
                customAdditionalControls={[]}
                customVolumeControls={[]}
              />
            </div>
          )}
        </div>
        {file && (
          <div style={{ width: '100%' }}>
            <Formik
              innerRef={currentFileNameRef}
              initialValues={initialValues}
              validationSchema={validationSchema}
            >
              {({ isSubmitting }) => (
                <Form>
                  <TextInputField
                    maxLength={50}
                    fieldName="file_name"
                    name="file_name"
                    fieldLabel="Enter file name"
                    type="text"
                    disabled={isSubmitting}
                    required
                  />
                  <div className="d-flex justify-content-around mt-3 mb-5 me-auto ms-auto">
                    <Button
                      variant="outlined"
                      disabled={isSubmitting}
                      color="secondary"
                      startIcon={
                        <FiberManualRecordIcon style={{ color: '#F4266E' }} />
                      }
                      onClick={handleStartOver}
                    >
                      Start Over
                    </Button>
                    <Button
                      startIcon={
                        createdAudioPlayback ? <PauseIcon /> : <PlayArrowIcon />
                      }
                      className="primary-btn"
                      variant="outlined"
                      color="primary"
                      disabled={isSubmitting}
                      style={{ width: '150px' }}
                      onClick={handleAudioPlayback}
                    >
                      {createdAudioPlayback ? 'Pause' : 'Play Back'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>

      <div className={styles.flexButtons}>
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

export default RecordGreeting;
