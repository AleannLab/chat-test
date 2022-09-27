import { observable, computed, action, flow } from "mobx";
import Resource from "./utils/resource";
import AsyncStore from "./utils/AsyncStore";
import CONSTANTS from "helpers/constants";
import PushNotification from "./utils/PushNotification";
import JsSIP from "jssip";
import IncomingCallAudio from "../assets/sounds/mountain_audio_calling.mp3";
import RingBackAudio from "../assets/sounds/ringback_tone.mp3";
import { store } from "stores";

export const CALL_STATUS = {
  INITIAL: 0,
  INCOMING: 1,
  OUTGOING: 2,
  ACTIVE: 3,
  HOLD: 4,
  MUTE: 5,
  DIALING: 6,
  NOTFOUND: 7,
  REJECTED: 8,
};

export class Dialer extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  session;
  isRegistering = false;
  isRegistered = false;
  error;
  isMicrophoneAllowed = true;

  isDialerExpanded = false;

  destination;

  callLines = [];
  activeCallLineNumber = -1;
  outboundUserName = "";
  isCallCanceled = false;

  initDetails = {};

  initialiing = false;

  @action.bound
  setCallCanceled(value) {
    this.isCallCanceled = value;
  }

  @action.bound
  setIsMicrophoneAllowed(value) {
    this.isMicrophoneAllowed = value;
  }

  @action.bound
  setDialerExpanded = (isExpanded) => {
    this.isDialerExpanded = isExpanded;
  };

  async _fetchDetails() {
    const result = await this.fetch(`${CONSTANTS.PBX_API_URL}/init-details`, {
      method: "POST",
    }).then((r) => r.json());

    if (!result.success) {
      store.notification.showError("something went wrong");
      return;
    }
    return result.data;
  }

  fetchDetails = flow(function* () {
    const initDetails = yield this._fetchDetails();
    return initDetails;
  });

  @action.bound
  initDialer = flow(function* () {
    this.initialiing = true;
    this.resetDialer();
    this.initDetails = yield this.fetchDetails();
    this.connect();
  });

  @action.bound
  refreshInitDetails = flow(function* () {
    this.initDetails = yield this.fetchDetails();
  });

  @action.bound
  setError = (e) => (this.error = e);

  @action.bound
  disconnect = () => {
    if (this.phone) this.phone.stop();
  };

  isInitDetailsExist = () =>
    this.initDetails && Object.keys(this.initDetails).length > 0 ? true : false;

  @action.bound
  connect = () => {
    if (this.isInitDetailsExist()) {
      const _self = this;
      const socket = new JsSIP.WebSocketInterface(this.initDetails.realm_uri);
      const realm_uri = this.initDetails.uri.match("[^@]*$")[0];

      const configuration = {
        sockets: [socket],
        uri: this.initDetails.uri,
        realm: realm_uri,
        password: this.initDetails.md5Secret,
        display_name: this.authentication.user.username,
        no_answer_timeout: 90,
        // turn_servers: { urls: "turn:turn.dev.meetkasper.com:3478", username: this.initDetails.display_name, credential: this.initDetails.hmackey },
      };

      //allowIncomingWhileBusy, enableRingingState  (old Twilio values)?

      this.phone = new JsSIP.UA(configuration);

      this.phone.start();

      // Websocket connection events

      this.phone.on("connecting", function (e) {
        // TODO: connecting
      });

      this.phone.on("connected", function (e) {
        // TODO: connected
      });

      this.phone.on("disconnected", function (e) {
        // TODO: disconnected
      });

      // SIP connection events
      this.phone.on("registered", function (e) {
        // TODO: registered
        _self.setRegistering(false);
        _self.setRegistered(true);
      });

      this.phone.on("unregistered", function (e) {
        // TODO: unregistered
      });

      this.phone.on("registrationFailed", function (e) {
        // TODO: registrationFailed
      });

      // New incoming/outgoing call
      this.phone.on("newRTCSession", function (e) {
        let line;
        const audio = new Audio(IncomingCallAudio);
        const notifyStore = store.notificationSetting;
        const { incoming_call_ring, mute_all_sounds } = {
          ...notifyStore.notifyData,
        };
        audio.loop = true;
        // InitialOutgoingInviteRequest, IncomingRequest

        const callSid = e.session?._id;
        let from;

        switch (e.originator) {
          case "local":
            line = _self.getCallLine(callSid);

            line.setCall(e.session);
            line.setOutboundUserName(_self.outboundUserName);
            line.setCallStatus(CALL_STATUS.DIALING);
            _self.setCallLine(callSid, line);

            _self.start();
            break;

          case "remote":
            if (_self.initDetails.dnd_enable) {
              e.session.terminate();
              break;
            }
            if (incoming_call_ring && !mute_all_sounds) {
              audio.play();
            }

            // Attach audio when the incoming call is answered
            e.session.on("peerconnection", function (e) {
              line.setCallStatus(CALL_STATUS.ACTIVE);
              e.peerconnection.addEventListener("addstream", function (e) {
                const sipAudio = new Audio();
                sipAudio.srcObject = e.stream;
                sipAudio.play();
              });
            });

            e.session.on("failed", function (e) {
              // this event gets triggered if another user picks up the call or the caller cancels it
              const originator = e.originator;
              const cause = e.cause;
              if (originator === "remote" && cause === "Canceled") {
                _self.setCallCanceled(true);
                setTimeout(() => _self.setCallCanceled(false), 4000);
              }
              audio.pause();
              _self.cleanupLineList();
            });

            e.session.on("ended", function (e) {
              _self.cleanupLineList();
              // _self.manageHoldCall();
            });

            e.session.on("accepted", function (e) {
              line.setCallStatus(CALL_STATUS.ACTIVE);
              audio.pause();
            });

            from = e.request.from._display_name;
            line = _self.getCallLine(callSid);
            line.setCall(e.session);
            line.setIsInboundCall(true);
            line.setCallStatus(CALL_STATUS.INCOMING);
            _self.setCallLine(callSid, line);
            _self.setDialerExpanded(true);

            // Notify user
            PushNotification.showIncomingCallNotification(from);

            break;
          default:
            break;
        }
      });

      this.deviceDestroyed = false;

      this.setRegistering(true);
      this.initialiing = false;
    }
  };

  @action.bound
  triggerEvent = (providerId) => {
    const destination = `*99`;
    if (this.phone) {
      const eventHandlers = {
        succeeded: function () {
          //TODO:succeeded
        },
        failed: function () {
          //TODO:failed
        },
      };
      const options = {
        eventHandlers: eventHandlers,
      };
      this.phone.sendMessage(destination, providerId, options);
    }
  };

  @action.bound
  startCall = (destination, userName = null) => {
    this.outboundUserName = userName || destination;
    this.destination = this.outboundUserName;
    if (this.phone) {
      const _self = this;
      const audio = new Audio(RingBackAudio);
      audio.loop = true;

      // Register callbacks to desired call events
      const eventHandlers = {
        progress: function (e) {
          const line = _self.getCallLine(_self.session._id);
          line.setCallStatus(CALL_STATUS.OUTGOING);
          audio.play();
        },
        failed: function (e) {
          const line = _self.getCallLine(_self.session._id);
          if (e.cause === "Not Found") line.setCallStatus(CALL_STATUS.NOTFOUND);
          if (e.cause === "Rejected") line.setCallStatus(CALL_STATUS.REJECTED);

          audio.pause();
          setTimeout(() => {
            _self.cleanupLineList();
          }, 1000);
        },
        ended: function (e) {
          JSON.stringify(e, function (_key, value) {
            //TODO:ended
          });
          audio.pause();
          _self.cleanupLineList();
        },
        confirmed: function (e) {
          const line = _self.getCallLine(_self.session._id);
          line.setCallStatus(CALL_STATUS.ACTIVE);
          audio.pause();
        },
      };

      var options = {
        eventHandlers: eventHandlers,
        mediaConstraints: {
          audio: true,
          video: false,
        },
        pcConfig: {
          iceServers: [
            {
              urls: `turn:${this.initDetails.realm_turn_uri}:3478`,
              username: this.initDetails.turnUsername,
              credential: this.initDetails.turnSecret,
            },
          ],
        },
      };

      this.session = this.phone.call(destination, options);

      this.session.connection.addEventListener("addstream", (e) => {
        const sipAudio = new Audio();
        sipAudio.srcObject = e.stream;
        sipAudio.play();
      });
    }
  };

  @action.bound
  startCallUser = (user) => {
    // this.outboundUserName = user.username || user.sip_username;
    this.startCall(user.sip_username, user.username);
  };

  @action.bound
  resetDialer = () => {
    this.deviceDestroyed = true;
    if (this.phone) {
      this.phone.terminateSessions();
      this.phone = null;
      this.deviceDestroyed = true;
    }

    this.setRegistered(false);
    this.setRegistering(false);
  };

  @action.bound
  setRegistering = (isRegistering) => (this.isRegistering = isRegistering);

  @action.bound
  setRegistered = (isRegistered) => (this.isRegistered = isRegistered);

  @action.bound
  setActiveLineNumber = (number) => (this.activeCallLineNumber = number);

  @computed get activeCallLine() {
    if (this.activeCallLineNumber < 0) return null;
    return this.callLines[this.activeCallLineNumber || 0];
  }

  @action.bound
  removeLine(id) {
    var lineIndex = this.getCallLineNumber(id);
    var line = this.getCallLine(id);
    line.reject();
    if (lineIndex > -1) {
      this.callLines.splice(lineIndex, 1);
    }

    if (this.activeCallLineNumber > this.callLines.length - 1) {
      this.activeCallLineNumber = this.callLines.length - 1;
    }
  }

  @action.bound
  cleanupLineList(id) {
    for (var i = 0; i < this.callLines.length; i++) {
      if (this.callLines[i].call.isEnded()) {
        this.callLines.splice(i, 1);
      }
    }

    if (this.activeCallLineNumber > this.callLines.length - 1) {
      this.activeCallLineNumber = this.callLines.length - 1;
    }
  }

  @action.bound
  setCallLine(id, callLine) {
    var lineIndex = this.getCallLineNumber(id);
    if (lineIndex > -1) {
      this.callLines[lineIndex] = callLine;
    }
  }

  @action.bound
  start() {
    const prevCallLines = this.callLines.filter(
      (line, index) => index !== this.activeCallLineNumber
    );
    prevCallLines.forEach((line) => line.manageHoldCall(true));
  }

  // @action.bound
  // manageHoldCall() {
  //   const allLinesOnHold = this.callLines.every((line) => line.isOnHold())
  //   if(allLinesOnHold) this.callLines[0].setIsOnHold(false)
  // }

  getCallLineNumber(id) {
    var line;

    // check if there exists any call with same id
    if (id) line = this.callLines.findIndex((i) => i.call && i.call._id === id);

    // if not found, find the first empty call slot
    if (line === -1) line = this.callLines.findIndex((i) => !i.call);

    return line;
  }

  getCallLine(id) {
    var line;
    // check if there exists any call with same id
    if (id) line = this.callLines.find((i) => i.call && i.call?._id === id);
    // if not found, find the first empty call slot
    if (!line) line = this.callLines.find((i) => !i.call);
    // if not found add a new one
    if (!line) {
      line = new CallLine(this.store);
      var newLineNumber = this.callLines.length;
      this.callLines.push(line);
      this.setActiveLineNumber(newLineNumber);
    }

    return line;
  }

  @action.bound
  setCallStatus(status) {
    this.callStatus = status;
  }
}

class CallLine extends Resource {
  isInboundCall = false;
  callStatus = CALL_STATUS.INITIAL;
  call;
  timer;
  lineNum;

  destination;

  isOnHold = false;
  isMute = false;
  isDialing;

  telnyxCallControlId;
  fromSipUserName;
  outboundUserName = "";

  intervalHandler = null;
  duration = 0;

  showTransferDialPad = false;

  constructor(store) {
    super(store);
    this.store = store;
    this.destination = store.dialer.destination;
  }

  @action.bound
  toggleTransferDialpad = () => {
    this.showTransferDialPad = !this.showTransferDialPad;
  };

  @action.bound
  setOutboundUserName = (userName) => {
    this.outboundUserName = userName;
  };

  @action.bound
  setCall = (call) => {
    this.call = call;

    if (this.call) {
      const callTo = this.call?._remote_identity?._uri?._user;

      this.store.patients.getPatientByPhoneNumberAction({
        phoneNo: `${callTo}`,
      });
    }
  };

  @action.bound
  answer = () => {
    if (this.call) {
      const options = {
        mediaConstraints: {
          audio: true,
          video: false,
        },
      };

      this.call.answer(options);
    }
  };

  @action.bound
  transfer = (destination) => {
    if (this.call) {
      const _self = this;
      const eventHandlers = {
        requestSucceeded(e) {
          _self.hangup();
        },
        requestFailed(e) {
          //TODO:requestFailed
        },
        failed(e) {
          //TODO:failed
        },
        accepted(e) {
          //TODO:accepted
          _self.hangup();
        },
      };
      this.call.refer(destination, {
        // replaces: this.call,
        eventHandlers,
      });
    }
  };

  @action.bound
  reject = () => {
    if (this.call) {
      this.call.terminate();
      this.outboundUserName = "";
    }
  };

  @action.bound
  hangup = () => {
    if (this.call) {
      this.call.terminate();
      this.outboundUserName = "";
      this.stopTicking();
    }
  };

  @action.bound
  sendDigits = (digits) => {
    if (this.call) {
      this.call.sendDTMF(digits);
    }
  };

  @action.bound
  setIsOnHold = (isOnHold) => {
    this.isOnHold = isOnHold;
  };

  @action.bound
  toggleHold = async () => {
    if (this.call) {
      if (this.isOnHold) {
        //TODO:isOnHold
        this.call.unhold();
      } else {
        //TODO:Holding
        this.call.hold();
      }

      const onHold = this.call.isOnHold().local;
      this.setIsOnHold(onHold);
    }
  };

  @action.bound
  manageHoldCall = (hold) => {
    if (hold) {
      this.call.hold();
    } else {
      this.call.unhold();
    }
    const onHold = this.call.isOnHold().local;
    this.setIsOnHold(onHold);
  };

  @action.bound
  setIsMuted = (isMute) => {
    //TODO:setIsMuted
    this.isMute = isMute;
  };

  @action.bound
  toggleMute = () => {
    if (this.call) {
      if (this.isMute) {
        //TODO:Unmuting
        this.call.unmute();
      } else {
        //TODO:Muting
        this.call.mute();
      }

      const muted = this.call.isMuted().audio;
      this.setIsMuted(muted);
    }
  };

  @action.bound
  setIsInboundCall = (isInboundCall) => (this.isInboundCall = isInboundCall);

  @action.bound
  setTelnyxCallControlId = (callControlId) =>
    (this.telnyxCallControlId = callControlId);

  @action.bound
  setIsDialing = (isDialing) => (this.isDialing = isDialing);

  @action.bound
  setLineNum = (lineNum) => (this.lineNum = lineNum);

  @action.bound
  setCallStatus = (status) => {
    if (this.callStatus !== status) {
      this.callStatus = status;
      if (this.callStatus === CALL_STATUS.ACTIVE) this.startTicking();
      else if (this.callStatus === CALL_STATUS.INITIAL) this.stopTicking();
    }
  };

  @computed get callTitle() {
    if (this.call) {
      if (
        this.call._remote_identity?._display_name &&
        this.call._direction === "incoming"
      ) {
        return this.call._remote_identity?._display_name.split(",")[0];
      }
      if (this.call._direction === "outgoing") {
        return this.outboundUserName;
      }
      const participant = this.store.patients.getPatientByPhoneNumber({
        phoneNo: `${this.call?._remote_identity?._uri?._user} `,
      });
      if (participant) return participant;
      return this.call?._remote_identity?._uri?._user;
    }
    return "No Calls";
  }

  @computed
  get callSubTitle() {
    switch (this.callStatus) {
      case CALL_STATUS.DIALING:
        return "Dialing";
      case CALL_STATUS.INCOMING:
        return "Incoming";
      case CALL_STATUS.OUTGOING:
        return "Ringing";
      case CALL_STATUS.NOTFOUND:
        return "Not Found";
      case CALL_STATUS.REJECTED:
        return "Rejected";

      case CALL_STATUS.ACTIVE:
        if (this.transferStore.loading) {
          return "Transferring";
        } else {
          const hours = Math.floor(this.duration / 60);
          const minutes = this.duration % 60;
          return `${hours > 9 ? hours : `0${hours}`}: ${
            minutes > 9 ? minutes : `0${minutes}`
          } `;
        }

      case CALL_STATUS.INITIAL:
      default:
        return "";
    }
  }

  @action.bound
  tick = () => this.duration++;

  @action.bound
  startTicking() {
    this.tick(); // initial tick
    this.intervalHandler = setInterval(() => this.tick(), 1000);
  }

  @action.bound
  stopTicking() {
    clearInterval(this.intervalHandler);
    this.intervalHandler = null;
  }

  transferStore = new AsyncStore();

  /*@action.bound
  transfer = flow(function* ({ callSid, target }) {
    this.transferStore.loading = true;
    try {
      var response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/dialer/transfer`,
        {
          method: 'POST',
          body: JSON.stringify({ callSid, target }),
        },
      ).then((r) => r.json());

      if (response.success === false) throw Error(response.error.Message);

      this.transferStore.data = response.data;
      this.transferStore.loading = false;
      this.transferStore.loaded = true;
      this.store.notification.showSuccess('Call transferred successfully.');
    } catch (e) {
      this.transferStore.error = e;
      this.transferStore.loading = false;
      this.store.notification.showError(
        'An unexpected error occurred while transferring the call',
      );
    }
  });*/
}
