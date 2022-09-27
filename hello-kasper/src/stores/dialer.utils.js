import { observable, computed, action, flow } from "mobx";
// import { TelnyxRTC } from "@telnyx/webrtc";
import Resource from "./utils/resource";
import AsyncStore from "./utils/AsyncStore";
import CONSTANTS from "helpers/constants";
import { Device } from "twilio-client";
import PushNotification from "./utils/PushNotification";

export const CALL_STATUS = {
  INITIAL: 0,
  INCOMING: 1,
  OUTGOING: 2,
  ACTIVE: 3,
  HOLD: 4,
  MUTE: 5,
  DIALING: 6,
};

export class Dialer extends Resource {
  constructor(store) {
    super(store);
    console.log(store);
    this.store = store;

    // this.callLines.push(new CallLine(this.store));
    // this.callLines.push(new CallLine(this.store));
    // this.callLines.push(new CallLine(this.store));
    // this.callLines.push(new CallLine(this.store));
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

  remoteStream;

  initDetails;

  initialiing = false;

  @action.bound
  setIsMicrophoneAllowed(value) {
    this.isMicrophoneAllowed = value;
  }

  @action.bound
  setDialerExpanded = (isExpanded) => {
    this.isDialerExpanded = isExpanded;
  };

  @action.bound
  initDialer = () => {
    try {
      // if (this.initialiing === false) {
      this.initialiing = true;
      // var { accessToken: { jwtToken } } = JSON.parse(localStorage.getItem("token"));
      this.resetDialer();
      // TODO fetch the init-details from server
      this.fetch(`${CONSTANTS.CALL_CONTROL_API_URL}/dialer/init-details`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          // TODO call connect
          this.initDetails = data;
          this.connect();
        });
      // }
    } catch (e) {
      this.store.notification.showError(e.message);
    }
  };

  @action.bound
  setError = (e) => (this.error = e);

  @action.bound
  connect = () => {
    try {
      var _self = this;

      this.device = new Device();
      this.device.setup(this.initDetails.jwt, {
        allowIncomingWhileBusy: true,
        debug: true,
        enableRingingState: true,
      });

      this.deviceDestroyed = false;

      this.device.on("cancel", (conn) => {
        // throw away the Connection and wait for the next call.
        console.log("device cancel", conn);
        const {
          parameters: { CallSid },
        } = conn;

        this.removeLine(CallSid);
      });

      this.device.on("connect", (conn) => {
        // a connection is opened, whether initiated using .connect() or via an accepted incoming connection.
        console.log("device connect", conn);
        const {
          parameters: { CallSid },
        } = conn;

        let line = this.getCallLine(CallSid); // new CallLine();
        line.setCall(conn);
        line.setCallStatus(CALL_STATUS.ACTIVE);
        this.setCallLine(CallSid, line);
      });

      this.device.on("disconnect", (conn) => {
        console.log("device disconnect", conn);
        // Fired any time a Connection is closed
      });

      this.device.on("error", (error) => {
        console.log("device ", error.message);
      });

      this.device.on("incoming", (conn) => {
        console.log("device incoming", conn);

        const {
          parameters: { CallSid, From },
        } = conn;

        let line = this.getCallLine(CallSid);
        line.setCall(conn);
        line.setIsInboundCall(true);
        line.setCallStatus(CALL_STATUS.INCOMING);
        this.setCallLine(CallSid, line);

        _self.setDialerExpanded(true);
        _self.setupConnectionHandler(conn);

        // Notify user
        PushNotification.showIncomingCallNotification(From);

        // connection.accept();
        // do awesome ui stuff here
        // $('#call-status').text("you're on a call!");
      });

      this.device.on("offline", (device) => {
        // This is triggered when the connection to Twilio drops or the device's token is invalid/expired
        console.log("device offline", device);
        if (!_self.deviceDestroyed) {
          console.log("Reinitializing dialer...");
          _self.initDialer();
        } else {
          console.log("Destroyed. NOT reinitializing dialer.");
        }
      });

      this.device.on("ready", function (device) {
        // The device is now ready
        console.log("device ready", device);
        _self.setRegistering(false);
        _self.setRegistered(true);
      });

      this.setRegistering(true);
      this.initialiing = false;
      // this.session.connect();
    } catch (e) {
      this.store.notification.showError(e.message);
    }
  };

  setupConnectionHandler = (connection) => {
    try {
      const _self = this;
      connection.on("accept", function (conn) {
        console.log("the call has accept", conn);
        const {
          parameters: { CallSid },
        } = this;

        let line = _self.getCallLine(CallSid); // new CallLine();
        line.setCall(conn);
        line.setCallStatus(CALL_STATUS.ACTIVE);

        _self.setCallLine(CallSid, line);
      });
      connection.on("cancel", function (conn) {
        console.log("the call has cancel", conn);
        const {
          parameters: { CallSid },
        } = this;
        _self.removeLine(CallSid);
      });
      connection.on("disconnect", function (conn) {
        console.log("the call has ended", conn);
        const {
          parameters: { CallSid },
        } = this;
        _self.removeLine(CallSid);
      });
      connection.on("error", function (error) {
        console.log("the call has ended", error);
      });
      connection.on("mute", function (isMute, conn) {
        console.log("the call has mute", isMute, conn);
        const {
          parameters: { CallSid },
        } = this;

        let line = _self.getCallLine(CallSid); // new CallLine();
        line.setCall(this);
        line.setIsMuted(isMute);
        _self.setCallLine(CallSid, line);
      });
      connection.on("reject", function () {
        console.log("the call has mute", this);
        const {
          parameters: { CallSid },
        } = this;
        _self.removeLine(CallSid);
      });
    } catch (e) {
      this.store.notification.showError(e.message);
    }
  };

  @action.bound
  startCall = (destination) => {
    try {
      if (this.device) {
        let conn = this.device.connect({
          To: destination,
        });

        console.log("startCall", conn.customParameters.get("To"));

        const {
          parameters: { CallSid },
        } = conn;

        let line = this.getCallLine(CallSid); // new CallLine();
        line.setCall(conn);
        line.setCallStatus(CALL_STATUS.OUTGOING);

        this.setCallLine(CallSid, line);

        this.setupConnectionHandler(conn);

        // var call = this.session.newCall({
        //   callerName: this.initDetails.callerName,
        //   callerNumber: this.initDetails.callerNumber,
        //   destinationNumber: destination,
        //   audio: true,
        //   video: false,
        // });

        // console.log(call);
      }
    } catch (e) {
      this.store.notification.showError(e.message);
    }
  };

  @action.bound
  startCallUser = (user) => {
    try {
      if (this.device) {
        let conn = this.device.connect({
          Client: `${user.user_id.replace(/-/g, "")}`,
          UserName: `${
            this.authentication.user.username || this.authentication.user.email
          }`,
          Caller: `${
            this.authentication.user.username || this.authentication.user.email
          }`,
          Callee: `${user.username || user.email}`,
        });

        console.log("startCall", conn.customParameters.get("To"));

        const {
          parameters: { CallSid },
        } = conn;

        let line = this.getCallLine(CallSid); // new CallLine();
        line.setCall(conn);
        line.setCallStatus(CALL_STATUS.OUTGOING);

        this.setCallLine(CallSid, line);

        this.setupConnectionHandler(conn);

        // var call = this.session.newCall({
        //   callerName: this.initDetails.callerName,
        //   callerNumber: this.initDetails.callerNumber,
        //   destinationNumber: destination,
        //   audio: true,
        //   video: false,
        // });

        // console.log(call);
      }
    } catch (e) {
      this.store.notification.showError(e.message);
    }
  };

  @action.bound
  resetDialer = () => {
    try {
      this.deviceDestroyed = true;
      if (this.device) {
        this.device.destroy();
        this.device = null;
        console.log("device destroyed");
        this.deviceDestroyed = true;
      }

      this.setRegistered(false);
      this.setRegistering(false);
    } catch (e) {
      this.store.notification.showError(e.message);
    }
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

  @computed get activeCallLineStream() {
    let callLine = this.callLines[this.activeCallLineNumber || 0];
    if (callLine && callLine.call) {
      console.log(
        "stream",
        callLine.call.remoteStream,
        callLine.call.options.remoteStream
      );
      return callLine.call.remoteStream || callLine.call.options.remoteStream;
    }
    return null;
  }

  @action.bound
  removeLine(id) {
    try {
      var lineIndex = this.getCallLineNumber(id);
      if (lineIndex > -1) {
        this.callLines[lineIndex].call.disconnect();
        this.callLines.splice(lineIndex, 1);
      }

      if (this.activeCallLineNumber > this.callLines.length - 1) {
        this.activeCallLineNumber = this.callLines.length - 1;
      }
    } catch (e) {
      this.store.notification.showError(e.message);
    }
  }

  @action.bound
  setCallLine(id, callLine) {
    try {
      console.log("setCallLine", this.callLines, callLine);
      var lineIndex = this.getCallLineNumber(id);
      if (lineIndex > -1) {
        this.callLines[lineIndex] = callLine;
        this.remoteStream = callLine.call
          ? callLine.call.remoteStream || callLine.call.options.remoteStream
          : null;
      }
    } catch (e) {
      this.store.notification.showError(e.message);
    }
  }

  getCallLineNumber(id) {
    try {
      var line;

      // check if there exists any call with same id
      if (id)
        line = this.callLines.findIndex(
          (i) => i.call && i.call.parameters.CallSid === id
        );

      // if not found, find the first empty call slot
      if (line === -1) line = this.callLines.findIndex((i) => !i.call);

      return line;
    } catch (e) {
      this.store.notification.showError(e.message);
    }
  }

  getCallLine(id) {
    try {
      var line;

      // check if there exists any call with same id
      if (id)
        line = this.callLines.find(
          (i) => i.call && i.call.parameters.CallSid === id
        );

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
    } catch (e) {
      this.store.notification.showError(e.message);
    }
  }

  @action.bound
  setCallStatus(status) {
    this.callStatus = status;
  }

  autoAnswerCallControlIds = [];

  dialCallStore = new AsyncStore();

  @action.bound
  dialCall = flow(function* ({ target, sipUserName }) {
    this.dialCallStore.loading = true;
    try {
      var response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/dialer/dial`,
        {
          method: "POST",
          body: JSON.stringify({ sipUserName, target }),
        }
      ).then((r) => r.json());

      if (response.success === false) throw Error(response.error.Message);

      this.dialCallStore.data = response.data;

      // let line = this.getCallLine(response.data);
      // line.setIsInboundCall(false);
      // line.setCallStatus(CALL_STATUS.DIALING);
      // line.setTelnyxCallControlId(response.data);
      // this.setCallLine(response.data, line);

      this.autoAnswerCallControlIds.push(response.data);
      this.autoAnswerCallIfExist(response.data);
      console.log(
        "autoAnswerEnabled add",
        this.autoAnswerCallControlIds,
        response.data
      );

      this.dialCallStore.loading = false;
      this.dialCallStore.loaded = true;
    } catch (e) {
      this.dialCallStore.error = e;
      this.dialCallStore.loading = false;
      this.store.notification.showError(e.message);
    }
  });
}

class CallLine extends Resource {
  isInboundCall = false;
  callStatus = CALL_STATUS.INITIAL;
  call;
  timer;
  lineNum;
  remoteStream;

  destination;

  isHeld;
  isMute;
  isDialing;

  telnyxCallControlId;
  fromSipUserName;

  intervalHandler = null;
  duration = 0;

  showTransferDialPad = false;

  constructor(store) {
    super(store);
    this.store = store;
  }

  @action.bound
  toggleTransferDialpad = () => {
    this.showTransferDialPad = !this.showTransferDialPad;
  };

  @action.bound
  setCall = (call) => {
    this.call = call;
    if (this.call) {
      this.store.patients.getPatientByPhoneNumberAction({
        phoneNo: `${this.call.parameters.From}`,
      });
      this.remoteStream =
        this.call.remoteStream || this.call.options.remoteStream || null;
    }
  };

  @action.bound
  answer = () => {
    if (this.call) this.call.accept();
  };

  // @action.bound
  // transfer = (destination) => {
  //   if (this.call) this.call.transfer({ to: destination });
  // };

  @action.bound
  reject = () => {
    if (this.call) this.call.reject();
  };

  @action.bound
  hangup = () => {
    if (this.call) {
      this.call.disconnect();
      this.stopTicking();
    }
  };

  @action.bound
  sendDigits = (digits) => {
    if (this.call) {
      this.call.sendDigits(digits);
    }
  };

  @action.bound
  toggleHold = async () => {
    if (this.call) {
      // const { parameters: { CallSid } } = this.call;
      // if (this.call.options.telnyxCallControlId) {
      await this.holdCall({ holdAction: this.isHeld ? "unhold" : "hold" });
      // } else {
      //   this.isHeld = !this.isHeld;
      //   // this.setCallStatus(CALL_STATUS.HOLD);
      //   this.call.toggleHold();
      // }
    }
  };

  @action.bound
  setIsMuted = (isMute) => {
    this.isMute = isMute;
  };

  @action.bound
  toggleMute = () => {
    if (this.call) {
      // this.isMute = !this.isMute;
      this.call.mute(!this.isMute);
      // this.setCallStatus(this.isMute ? CALL_STATUS.MUTE : CALL_STATUS.ACTIVE);
      // this.call.toggleAudioMute();
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
    if (!this.call) return "No Calls";

    if (
      this.call.customParameters.get("Caller") &&
      this.call.direction === "INCOMING"
    )
      return this.call.customParameters.get("Caller");

    if (
      this.call.customParameters.get("Callee") &&
      this.call.direction === "OUTGOING"
    )
      return this.call.customParameters.get("Callee");

    return this.store.patients.getPatientByPhoneNumber({
      phoneNo: `${
        this.call.customParameters.get("To") || this.call.parameters.From
      } `,
    });
  }

  @computed
  get callSubTitle() {
    switch (this.callStatus) {
      case CALL_STATUS.DIALING:
        return "Dialing";
      case CALL_STATUS.INCOMING:
        return "Incoming";
      case CALL_STATUS.OUTGOING:
        return "Outgoing";

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
    console.log("called startTicking");
    this.tick(); // initial tick
    this.intervalHandler = setInterval(() => this.tick(), 1000);
  }

  @action.bound
  stopTicking() {
    clearInterval(this.intervalHandler);
    this.intervalHandler = null;
  }

  holdCallStore = new AsyncStore();

  @action.bound
  holdCall = flow(function* ({ holdAction }) {
    this.holdCallStore.loading = true;
    const {
      parameters: { CallSid },
    } = this.call;
    try {
      var response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/dialer/${holdAction}`,
        {
          method: "POST",
          body: JSON.stringify({ callSid: CallSid }),
        }
      ).then((r) => r.json());

      if (response.success === false) throw Error(response.error.Message);

      this.isHeld = !this.isHeld;
      // this.setCallStatus(holdAction === "hold" ? CALL_STATUS.HOLD : CALL_STATUS.ACTIVE);
      // this.call.toggleHold();

      this.holdCallStore.data = response.data;
      this.holdCallStore.loading = false;
      this.holdCallStore.loaded = true;
    } catch (e) {
      this.holdCallStore.error = e;
      this.holdCallStore.loading = false;
      this.store.notification.showError(
        "An unexpected error occurred while placing the call on hold"
      );
    }
  });

  transferStore = new AsyncStore();

  @action.bound
  transfer = flow(function* ({ callSid, target }) {
    this.transferStore.loading = true;
    try {
      var response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/dialer/transfer`,
        {
          method: "POST",
          body: JSON.stringify({ callSid, target }),
        }
      ).then((r) => r.json());

      if (response.success === false) throw Error(response.error.Message);

      this.transferStore.data = response.data;
      this.transferStore.loading = false;
      this.transferStore.loaded = true;
      this.store.notification.showSuccess("Call transferred successfully.");
    } catch (e) {
      this.transferStore.error = e;
      this.transferStore.loading = false;
      this.store.notification.showError(
        "An unexpected error occurred while transferring the call"
      );
    }
  });

  getCallStore = new AsyncStore();

  @action.bound
  getCall = flow(function* ({ callControlId }) {
    this.getCallStore.loading = true;
    try {
      var response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/dialer/call/${callControlId}`,
        { method: "GET" }
      ).then((r) => r.json());

      if (response.success === false) throw Error(response.error.Message);

      this.getCallStore.data = response.data;

      if (this.getCallStore.data.autoAnswer === true) {
        this.answer();
      }

      this.getCallStore.loading = false;
      this.getCallStore.loaded = true;
    } catch (e) {
      this.getCallStore.error = e;
      this.getCallStore.loading = false;
      this.store.notification.showError(e.message);
    }
  });
}
