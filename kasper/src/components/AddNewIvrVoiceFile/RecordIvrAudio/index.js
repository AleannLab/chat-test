import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import AudioRecorder from '../../Core/AudioRecorder';
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

const RecordIvrAudio = (
  {
    greetingType,
    handleClose,
    handleSaving,
    onAudioFileSelection,
    isRecording,
    setIsRecording,
  },
  ref,
) => {
  const playerRef = useRef(null);
  const submitButtonRef = useRef(null);
  const [file, setFile] = useState('');
  const [createdAudioPlayback, setCreatedAudioPlayback] = useState(false);
  const [audioGreeting, setAudioGreeting] = useState({
    audioBlob: '',
    audioGenerated: '',
    saved: false,
    audioUrl: '',
    audioFile: '',
  });
  const { notification } = useStores();

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
      // audioGreeting.audioGenerated.pause();
      setCreatedAudioPlayback(false);
      playerRef.current.audio.current.pause();
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
        setTimeout(() => {
          notification.hideNotification();
          handleClose();
        }, 3000);
      });
  };

  useImperativeHandle(ref, () => ({
    triggerSubmit() {
      if (file) submitButtonRef.current.click();
    },
  }));

  const handleStartOver = () => {
    setFile('');
    // setIsSaving(false);
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
                <div className="d-flex justify-content-between mt-4">
                  <Button
                    ref={submitButtonRef}
                    className={styles.hidden}
                    variant="contained"
                    color="secondary"
                    onClick={handleSubmitForm}
                    type="submit"
                  ></Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </>
  );
};

export default forwardRef(RecordIvrAudio);
