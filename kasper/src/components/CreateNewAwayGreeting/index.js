import React, { useEffect, useState, createRef } from 'react';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import Button from '@material-ui/core/Button';
import { Form, Formik } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import AudioPlayer from 'react-h5-audio-player';

import 'react-h5-audio-player/lib/styles.css';
import { useStores } from 'hooks/useStores';
import TextInputField from 'components/Core/Formik/TextInputField';
import AudioRecorder from 'components/Core/AudioRecorder';
import Modal from 'components/Core/Modal';
import { ReactComponent as MicIcon } from 'assets/images/mic.svg';
import styles from './index.module.css';
import './styles.css';

const CreateNewAwayGreeting = ({ onClose, greetingStore, name }) => {
  const { notification } = useStores();
  const [file, setFile] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [createdAudioPlayback, setCreatedAudioPlayback] = useState(false);
  const greetingType = greetingStore;
  const [audioGreeting, setAudioGreeting] = useState({
    audioBlob: '',
    audioGenerated: '',
    saved: false,
    audioUrl: '',
    audioFile: '',
  });
  const playerRef = createRef();

  useEffect(() => {
    if (audioGreeting.saved) {
      setFile(audioGreeting.audioFile);
    }
  }, [audioGreeting]);

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
                  setTimeout(() => {
                    notification.hideNotification();
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
        setTimeout(() => {
          notification.hideNotification();
          handleClose();
        }, 3000);
      });
  };

  const playAudio = (status) => {
    if (status) {
      setCreatedAudioPlayback(true);
      playerRef.current.audio.current.play();
      playerRef.current.audio.current.addEventListener('ended', () => {
        setCreatedAudioPlayback(false);
      });
    } else {
      // audioGreeting.audioGenerated.pause();
      setCreatedAudioPlayback(false);
      playerRef.current.audio.current.pause();
    }
  };

  const handleAudioPlayback = () => {
    if (createdAudioPlayback) {
      playAudio(false);
    } else {
      playAudio(true);
    }
  };

  const handleStartOver = () => {
    setFile('');
    setIsSaving(false);
    playAudio(false);
    setCreatedAudioPlayback(false);
    setAudioGreeting({
      audioBlob: '',
      audioGenerated: '',
      saved: false,
      audioFile: '',
    });
  };

  const handleClose = () => {
    onClose();
  };

  const initialValues = {
    file_name: file ? file.name.split('.')[0] : '',
  };

  const validationSchema = Yup.object({
    file_name: Yup.string()
      .max(50, 'Must be 50 characters or less')
      .required('File name is required'),
  });

  const handleSubmitForm = (e) => {
    if (e.file_name) {
      const currentFileExtension = file.name
        .split('.')
        [file.name.split('.').length - 1].toLowerCase();
      const completeFileName = e.file_name + '.' + currentFileExtension;
      handleSave(e.file_name, completeFileName);
    }
  };

  return (
    <Modal
      size="sm"
      header={`Create New ${
        name === 'phoneFaxVoicemailGreeting'
          ? 'Voicemail'
          : name === 'phoneFaxIVRVoiceMailGreeting'
          ? 'IVR'
          : name === 'phoneFaxVacationGreeting'
          ? 'Vacation'
          : 'Away'
      } Greeting`}
      body={
        <div className={styles.addPatientContainer}>
          <MicIcon className={styles.micIcon} />
          {!file && <AudioRecorder onGenerateAudioURL={setAudioGreeting} />}
          {file && (
            <>
              <div style={{ width: '100%', marginTop: '20px' }}>
                <AudioPlayer
                  src={audioGreeting.audioUrl}
                  showJumpControls={false}
                  showSkipControls={false}
                  ref={playerRef}
                  customAdditionalControls={[]}
                  customVolumeControls={[]}
                />
              </div>

              <div style={{ width: '100%' }}>
                <Formik
                  initialValues={initialValues}
                  onSubmit={handleSubmitForm}
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
                            <FiberManualRecordIcon
                              style={{ color: '#F4266E' }}
                            />
                          }
                          onClick={handleStartOver}
                        >
                          Start Over
                        </Button>
                        <Button
                          startIcon={
                            createdAudioPlayback ? (
                              <PauseIcon />
                            ) : (
                              <PlayArrowIcon />
                            )
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
                      <div className="d-flex justify-content-between mt-4">
                        <Button
                          className="primary-btn me-auto"
                          variant="outlined"
                          color="primary"
                          onClick={handleClose}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>

                        <Button
                          className="secondary-btn"
                          variant="contained"
                          color="secondary"
                          onClick={handleSubmitForm}
                          type="submit"
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving' : 'Save'}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </>
          )}
        </div>
      }
      onClose={handleClose}
    />
  );
};

export default CreateNewAwayGreeting;
