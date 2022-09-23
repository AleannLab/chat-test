import React, { useState, useEffect } from 'react';

import CallIcon from '@material-ui/icons/Call';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import moment from 'moment-timezone';

import { useAuthToken } from 'hooks/useAuthToken';
import { useStores } from 'hooks/useStores';
import DialerRoundButton from 'components/Dialer/DialerRoundButton';
import { getActivityType } from 'components/Logs/activityType';
import { checkHwNumber, planeNumber } from 'helpers/validations';
import { checkSignificantLength } from 'helpers/misc';
import { secondsToHhMmss } from 'helpers/misc';

import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';

import styles from './index.module.css';
import './index.css';

const CallActivityLog = ({ key, log, patientName }) => {
  const [error, setError] = useState(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [audioTextLabel, setAudioTextLabel] = useState('Play Recording');
  const { utils, dialer } = useStores();
  const activityType = getActivityType(Number(log.log_type_id));
  const authToken = useAuthToken();
  const file = utils.prepareMediaUrl({ uuid: log.media_uuid, authToken });

  const calledBackDate =
    log.called_back && log.calledBackDate ? moment(log.calledBackDate) : null;

  useEffect(() => {
    setError(null);
  }, [file]);

  useEffect(() => {
    const text = isPlayingRecording ? 'Pause' : 'Play Recording';
    setAudioTextLabel(text);
  }, [isPlayingRecording, setAudioTextLabel]);

  const logMessage = () => {
    const message =
      log.log_type_id == '3'
        ? `from phone ${log.from_did}`
        : `from patient ${patientName}`;
    return (
      <span>
        <b>{activityType.itemLabel}</b>
        &nbsp;
        {message}
        &nbsp;
        {log.log_type_id != '4' && (
          <span className={styles.callDuration}>
            {secondsToHhMmss(log.duration)}
          </span>
        )}
      </span>
    );
  };

  const isActiveCallLIne = (phoneNumber) => {
    if (phoneNumber) {
      const hardware = checkHwNumber(phoneNumber);
      const currNumber = hardware
        ? phoneNumber
        : planeNumber(phoneNumber).getNumber();
      const isActiveLineExist = dialer.callLines.find(
        (call) => call.destination === currNumber,
      );
      return !!isActiveLineExist;
    }
  };

  const onSubmit = (number) => {
    const hardware = checkHwNumber(number);
    let phoneNumber = hardware ? number : planeNumber(number);
    if (phoneNumber) {
      dialer.startCall(
        hardware ? number : checkSignificantLength(phoneNumber, phoneNumber),
      );
    }
  };

  const CallAgainAction = () => {
    return (
      <div className={styles.activityLogActionCallBack}>
        <div className={styles.activityLogActionStacked}>
          <div className={styles.activityLogActionCallBackControl}>
            <DialerRoundButton
              icon={<CallIcon />}
              backgroundColor={'#1ABA17'}
              onClick={
                isActiveCallLIne(log.from_did)
                  ? null
                  : () => onSubmit(log.from_did)
              }
            />
            <span style={{ marginLeft: '10px' }}>Call back</span>
          </div>
        </div>
      </div>
    );
  };

  const AudioAction = () => {
    return file ? (
      <>
        <AudioPlayer
          className="voicemail-playback"
          src={file}
          showJumpControls={false}
          showSkipControls={false}
          onPlayError={() =>
            setError(
              'Unable to play recording. Please try to refresh your page.',
            )
          }
          onPlaying={() => setIsPlayingRecording(true)}
          onPlay={() => dialer.triggerEvent(`${log.provider_id}_${log.uuid}`)}
          onPause={() => setIsPlayingRecording(false)}
          customAdditionalControls={[]}
          customVolumeControls={[]}
          customProgressBarSection={[]}
        />
        <div className="audio-play-pause-text">
          <span>{audioTextLabel}</span>
        </div>
      </>
    ) : null;
  };

  const actionComponent = () => {
    const logType = log.log_type_id;
    switch (logType) {
      case 2:
        return <AudioAction />;
      case 4:
        return <CallAgainAction />;
      default:
        return null;
    }
  };

  const logAction = () => {
    const component = actionComponent();
    return component ? (
      <div
        className={styles.activityLogAction}
        style={{ width: file ? '150px' : 'auto' }}
      >
        {component}
      </div>
    ) : null;
  };

  return (
    <div
      className={styles.activityLogWrapper}
      key={key}
      style={{ width: log.log_type_id != '3' ? '500px' : 'inherit' }}
    >
      <div className={styles.activityLogIcon}>{activityType.icon}</div>
      <div className={styles.activityLogText}>{logMessage()}</div>
      {log.log_type_id == '4' && log.called_back ? (
        <>
          <CheckCircleSharpIcon />
          <span>
            Called {'06/07/2022' || calledBackDate.format('MM/DD/YYYY')} at{' '}
            {'4:35 pm' || calledBackDate.format('h:mm a')}
          </span>
        </>
      ) : (
        logAction()
      )}
      <></>
    </div>
  );
};

export default CallActivityLog;
