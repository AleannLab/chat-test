import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import StopIcon from "@material-ui/icons/Stop";
import RecordingIcon from "assets/images/recording.svg";
import MicRecorder from "mic-recorder-to-mp3";
import clsx from "clsx";

const UP_BAR_COLOR = "#432E88";
const DOWN_BAR_COLOR = "#F4266E";
const DIVISION_FACTOR = 8;

const AudioRecorder = ({
  outerIsRecording,
  setOuterIsRecording,
  onGenerateAudioURL,
  type = "",
}) => {
  const [innerIsRecording, setInnerIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [timer, setTimer] = useState(0);

  const isControlled = outerIsRecording !== undefined;
  const isRecording = outerIsRecording ?? innerIsRecording;

  const setIsRecording = (value) => {
    if (isControlled) setOuterIsRecording(value);
    else setInnerIsRecording(value);
  };

  let timerInterval = null;
  let audioCtx;
  let canvasUp;
  let canvasUpCtx;
  let canvasDown;
  let canvasDownCtx;

  useEffect(() => {
    setIsRecording(false);
    setRecorder(null);
    setTimer(0);

    return () => {
      setIsRecording(false);
      setRecorder(null);
      setTimer(0);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Generate top section animated stream bars
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    canvasUp = document.querySelector(".visualizer1");
    console.log({ canvasUp });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    canvasUpCtx = canvasUp.getContext("2d");
  }, []);

  /**
   * Generate bottom section animated stream bars
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    canvasDown = document.querySelector(".visualizer2");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    canvasDownCtx = canvasDown.getContext("2d");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Timer for audio recorder
   */
  useEffect(() => {
    if (isRecording) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timerInterval = setInterval(() => {
        setTimer(timer + 1);
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [isRecording, timer]);

  /**
   *
   * Generate visualization of streams
   */
  function visualize(stream) {
    // if (!audioCtx) {
    audioCtx = new AudioContext();
    // }

    const source = audioCtx.createMediaStreamSource(stream);

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    drawUp();

    function drawUp() {
      const WIDTH = canvasUp?.width ?? 0;
      const HEIGHT = canvasUp?.height ?? 0;
      let x = 0;
      const width = 4;
      const height = 4;

      requestAnimationFrame(drawUp);
      analyser.getByteTimeDomainData(dataArray);
      canvasUpCtx.fillStyle = "rgb(255, 255, 255)";
      canvasUpCtx.fillRect(0, 0, WIDTH, HEIGHT);
      canvasUpCtx.beginPath();

      for (let i = 0; i < bufferLength; i++) {
        var h = dataArray[i] / DIVISION_FACTOR;

        canvasUpCtx.rect(x, HEIGHT, width, -height);
        canvasUpCtx.fillStyle = UP_BAR_COLOR;
        canvasUpCtx.fill();

        if (dataArray[i] / 128 > 1) {
          canvasUpCtx.rect(x, HEIGHT, width, -h);
          canvasUpCtx.fillStyle = UP_BAR_COLOR;
          canvasUpCtx.fill();
        }
        x += 8;
      }
    }

    drawDown();

    function drawDown() {
      const WIDTH = canvasDown.width;
      const HEIGHT = canvasDown.height;
      let x = 0;
      const width = 4;
      const height = 4;

      requestAnimationFrame(drawDown);
      analyser.getByteTimeDomainData(dataArray);
      canvasDownCtx.fillStyle = "rgb(255, 255, 255)";
      canvasDownCtx.fillRect(0, 0, WIDTH, HEIGHT);
      canvasDownCtx.beginPath();

      for (let i = 0; i < bufferLength; i++) {
        var h = dataArray[i] / DIVISION_FACTOR;

        canvasDownCtx.rect(x, 0, width, height);
        canvasDownCtx.fillStyle = DOWN_BAR_COLOR;
        canvasDownCtx.fill();

        if (dataArray[i] / 128 > 1) {
          canvasDownCtx.rect(x, 0, width, h);
          canvasDownCtx.fillStyle = DOWN_BAR_COLOR;
          canvasDownCtx.fill();
        }
        x += 8;
      }
    }
  }

  const recordAudio = () => {
    return new Promise((resolve) => {
      // navigator.mediaDevices.getUserMedia({ audio: true })
      //     .then(stream => {
      // const mediaRecorder = new MediaRecorder(stream);
      // const audioChunks = [];
      // mediaRecorder.addEventListener("dataavailable", event => {
      //     audioChunks.push(event.data);
      // });

      const micRecorder = new MicRecorder({
        bitRate: 128,
      });

      // visualize(stream);

      const start = () => {
        // mediaRecorder.start();
        micRecorder.start().then((data) => {
          visualize(data);
        });
      };

      const stop = () => {
        return new Promise((resolveInner) => {
          micRecorder
            .stop()
            .getMp3()
            .then(([buffer, blob]) => {
              const file = new File(buffer, "Custom Greeting.mp3", {
                type: blob.type,
                lastModified: Date.now(),
              });
              const audioUrl = URL.createObjectURL(blob);
              const audioGenerated = new Audio(audioUrl);
              onGenerateAudioURL({
                audioBlob: blob,
                audioGenerated: audioGenerated,
                audioUrl: audioUrl,
                audioFile: file,
                saved: true,
              });
              // const player = new Audio(URL.createObjectURL(file));
              // player.play();
              resolveInner({ blob, audioUrl });
            });

          // To stop all streams which mutes the microphone and removes the recording icon from the tab
          // stream.getAudioTracks().forEach(function (track) {
          //     track.stop();
          // });
          // mediaRecorder.stop();
          setRecorder(null);
          setIsRecording(false);
          setTimer(0);
          timerInterval = null;
        });
      };
      resolve({ start, stop });
      // });
    });
  };

  const startAudio = async () => {
    const recorderInstance = await recordAudio();
    setRecorder(recorderInstance);
    recorderInstance.start();
    setIsRecording(true);
  };

  const stopAudio = async () => {
    if (recorder) {
      await recorder.stop(timer);
      setRecorder(null);
      setIsRecording(false);
      setTimer(0);
    }
  };

  return (
    <div
      className={clsx(!type && styles.root, type == "ivr" && styles.ivrRoot)}
    >
      <div className={styles.canvasContainer}>
        <canvas
          className="visualizer1"
          height={isRecording ? 20 : 0}
          width="auto"
        ></canvas>
        <canvas
          className="visualizer2"
          height={isRecording ? 20 : 0}
          width="auto"
        ></canvas>
        <div
          className={`${styles.defaultContiner} ${
            isRecording ? styles.hidden : ""
          }`}
        >
          <RecordingIcon style={{ flex: 1, height: "100%" }} />
        </div>
        {!type && (
          <div className={styles.timeContainer}>
            <div>{new Date(timer * 1000).toISOString().substr(11, 8)}</div>
            <div className={styles.recordingLabel}>
              {isRecording ? "Recording..." : null}&nbsp;
            </div>
          </div>
        )}
      </div>
      {type === "ivr" && (
        <div className={styles.timeContainer}>
          <div>{new Date(timer * 1000).toISOString().substr(11, 8)}</div>
        </div>
      )}
      <div className={clsx(!type && "w-100")}>
        {isRecording ? (
          <Button
            className="primary-btn w-100"
            variant="outlined"
            color="secondary"
            startIcon={<StopIcon />}
            onClick={stopAudio}
          >
            Stop {!type && " Recording"}
          </Button>
        ) : (
          <Button
            className="primary-btn w-100"
            variant="outlined"
            color="secondary"
            startIcon={
              <FiberManualRecordIcon className={styles.iconStartRec} />
            }
            onClick={startAudio}
          >
            Start {!type && " Recording"}
          </Button>
        )}

        {/* TODO: DO NOT REMOVE THIS CODE BLOCK */}
        {/* <Button
                    className="secondary-btn"
                    variant="outlined"
                    color="secondary"
                    onClick={() => audio.play()}
                >
                    Play
                </Button> */}
      </div>
    </div>
  );
};

AudioRecorder.propTypes = {
  outerIsRecording: PropTypes.bool,
  setOuterIsRecording: PropTypes.func,
  onGenerateAudioURL: PropTypes.func,
  type: PropTypes.string,
};

AudioRecorder.defaultProps = {
  onGenerateAudioURL: () => {},
};

export default AudioRecorder;
