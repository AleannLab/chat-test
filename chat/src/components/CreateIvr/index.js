/* eslint-disable react/display-name */
import React, { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import Modal from "components/Core/Modal";
import Button from "@material-ui/core/Button";
import { useHistory, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useStores } from "hooks/useStores";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextInputField from "components/Core/Formik/TextInputField";
import SelectField from "components/Core/Formik/SelectField";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import CloudUpload from "assets/images/cloud-upload-pink.svg";
import { observer } from "mobx-react";
import { cloneDeep } from "lodash";
import clsx from "clsx";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import AddNewIvrVoiceFile from "components/AddNewIvrVoiceFile";
import PencilIcon from "assets/images/custom-pencil.svg";
import DeleteIcon from "assets/images/custom-delete.svg";
import { useQuery, useQueryClient } from "react-query";
import { useAuthToken } from "hooks/useAuthToken";
import styles from "./index.module.css";
import PhoneNumber from "awesome-phonenumber";
import { makeStyles, Select } from "@material-ui/core";
import IvrSkeleton from "./IvrSkeleton";
import { nanoid } from "nanoid";
import AutoCompleteInputField from "components/Core/Formik/AutoCompleteInputField";
import { IVR_ACTIONS } from "helpers/constants";
import { normalizeNumber } from "helpers/misc";
import HardwarePhoneIcon from "assets/images/telephone.svg";

const useStyles = makeStyles({
  root: {
    background: "transparent",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent !important",
    },
    "& .MuiOutlinedInput-root": {
      background: "transparent !important",
    },
  },
  popupIndicator: {
    marginTop: "2px",
  },
  noBorder: {
    border: "none",
  },
});

const ivrKeys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const {
  TRANSFER_TO_IVR,
  TRANSFER_TO_AGENT,
  TRANSFER_TO_TEAM,
  TRANSFER_TO_EXTERNAL_NUMBER,
  REPEAT_IVR,
  VOICEMAIL,
} = IVR_ACTIONS;

const actionTypes = [
  { value: TRANSFER_TO_AGENT, label: "Transfer to agent" },
  { value: TRANSFER_TO_IVR, label: "Transfer to sub-IVR" },
  { value: TRANSFER_TO_TEAM, label: "Transfer to group" },
  { value: TRANSFER_TO_EXTERNAL_NUMBER, label: "Transfer to external number" },
];

const falioverActionTypes = [
  { value: TRANSFER_TO_AGENT, label: "Transfer to agent" },
  { value: TRANSFER_TO_TEAM, label: "Transfer to group" },
  { value: VOICEMAIL, label: "Voicemail" },
  { value: REPEAT_IVR, label: "Repeat IVR" },
  { value: TRANSFER_TO_EXTERNAL_NUMBER, label: "Transfer to external number" },
];

const CreateIvr = () => {
  const {
    createIvr,
    notification,
    incomingCalls: incomingCallsStore,
    ivrSettings,
    phoneFaxIVRVoicemailGreeting,
  } = useStores();
  const [ivrArr, setIvrArr] = useState([createIvr.initialState]);
  const [isIvrTreeValid, setIsIvrTreeValid] = useState(false);
  const history = useHistory();
  const { id } = useParams();
  const ivrTree = cloneDeep(createIvr.ivrTree);
  const queryClient = useQueryClient();
  var ayt = PhoneNumber.getAsYouType("US");
  const ivrTreeRef = useRef(null);
  const classes = useStyles();

  useEffect(() => {
    createIvr.resetIvr();
  }, [createIvr]);

  const { data: agents, isLoading: isLoadingAgents } = useQuery(
    "usersAlongWithIncomingCalls",
    () => incomingCallsStore.getUsers(),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    }
  );

  const getAgentById = (agentId) =>
    agents?.find((agent) => agent.id === agentId);

  const { data: callGroups, isLoading: isLoadingGroups } = useQuery(
    ["fetchGroups"],
    () => ivrSettings.fetchGroups(),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    }
  );

  const getCallGroupById = (groupId) =>
    callGroups?.find((group) => group.id === groupId);

  const getIvrInfoQuery = useQuery(
    ["fetchIvr", id],
    () => createIvr.getIvrInfo(id),
    {
      enabled: Boolean(id) && !isLoadingAgents && !isLoadingGroups,
    }
  );

  const { isLoading: isFetchingIvr, data: ivrInfo } = getIvrInfoQuery;

  const resetAudio = () => {
    phoneFaxIVRVoicemailGreeting.currentlyPlaying.file &&
      phoneFaxIVRVoicemailGreeting.currentlyPlaying.file.pause();
    phoneFaxIVRVoicemailGreeting.setCurrentlyPlaying({
      uuid: null,
      shouldPlay: false,
      downloadUrl: null,
      file: null,
    });
  };

  const validateTree = (ivrTree) => {
    removeErrorClasses();
    for (const ivr of ivrTree) {
      if (ivr.action === TRANSFER_TO_EXTERNAL_NUMBER && ivr.actionValue) {
        const phoneLength = ivr.actionValue.length;
        if (phoneLength < 14 || phoneLength > 14) {
          notification.showError("Invalid phoneNumber");
          setIsIvrTreeValid(false);
          manageIvrRowColor(ivr.id);
          break;
        }
      }
      if ("audio" in ivr && Object.values(ivr.audio).length < 1) {
        notification.showError("IVR audio is required");
        setIsIvrTreeValid(false);
        manageIvrRowColor(ivr.id);
        break;
      }
      if ("key" in ivr && ivr.key === "none") {
        notification.showError("Key field is required");
        setIsIvrTreeValid(false);
        manageIvrRowColor(ivr.id);
        break;
      }
      if (("action" in ivr && !ivr.action) || ivr.action === "none") {
        notification.showError("Action field is required");
        setIsIvrTreeValid(false);
        manageIvrRowColor(ivr.id);
        break;
      }
      if (
        "actionValue" in ivr &&
        ivr.action !== TRANSFER_TO_IVR &&
        !ivr.actionValue
      ) {
        notification.showError("Action Value is required");
        setIsIvrTreeValid(false);
        manageIvrRowColor(ivr.id);
        break;
      }
      if (
        "failoverTime" in ivr &&
        !ivr.failoverTime &&
        ivr.action !== TRANSFER_TO_IVR
      ) {
        notification.showError("Timeout is required");
        setIsIvrTreeValid(false);
        manageIvrRowColor(ivr.id);
        break;
      }
      if (
        "failoverTime" in ivr &&
        ivr.failoverTime > 300 &&
        ivr.action !== TRANSFER_TO_IVR
      ) {
        notification.showError(
          "Timeout must be less than or equal to 300 seconds"
        );
        setIsIvrTreeValid(false);
        manageIvrRowColor(ivr.id);
        break;
      }
      if (
        (("failoverAction" in ivr && !ivr.failoverAction) ||
          ivr.failoverAction === "none") &&
        ivr.action !== TRANSFER_TO_IVR
      ) {
        notification.showError("Timeout Action is required");
        setIsIvrTreeValid(false);
        manageIvrRowColor(ivr.id);
        break;
      }
      if (
        "failoverValue" in ivr &&
        !ivr.failoverValue &&
        ivr.failoverAction !== VOICEMAIL &&
        ivr.failoverAction !== REPEAT_IVR &&
        ivr.action !== TRANSFER_TO_IVR
      ) {
        notification.showError("Timeout Value is required");
        setIsIvrTreeValid(false);
        manageIvrRowColor(ivr.id);
        break;
      } else if (ivr.action === TRANSFER_TO_IVR && ivr.children.length > 0) {
        validateTree(ivr.children);
      } else {
        manageIvrRowColor(ivr.id, true);
        setIsIvrTreeValid(true);
      }
    }
  };

  const manageIvrRowColor = (id, hide) => {
    const element = ivrTreeRef.current;
    element
      .querySelector(`#id-${id}`)
      .classList.toggle(styles.rowError, !hide ?? true);
  };

  const removeErrorClasses = () => {
    const element = ivrTreeRef.current;
    element
      .querySelectorAll(".containerBorder")
      .forEach((el) => el.classList.remove(styles.rowError));
  };

  const validationSchema = Yup.object({
    name: Yup.string().trim().required("A name is required"),
    failoverTime: Yup.number()
      .max(300, "Failover Time should be equal or less than 300 seconds")
      .required("Required"),
    failoverAction: Yup.string().trim().required("Required"),
    failoverValue: Yup.mixed()
      .nullable(true)
      .when("failoverAction", {
        is: VOICEMAIL,
        then: Yup.string().notRequired(),
        otherwise: Yup.mixed().required("Required"),
      })
      .when("failoverAction", {
        is: TRANSFER_TO_EXTERNAL_NUMBER,
        then: Yup.string()
          .trim()
          .required("Required")
          .min(14, "Invalid phone number")
          .max(14, "Invalid phone number"),
      }),
  });

  const handlefailoverValue = (values) => {
    if (values.failoverAction === TRANSFER_TO_EXTERNAL_NUMBER) {
      return new PhoneNumber(values.failoverValue, "US").getNumber();
    } else if (values.failoverAction === TRANSFER_TO_AGENT) {
      return {
        id: values.failoverValue.id,
        user_exten: agents?.find(
          (agent) => agent.id === values.failoverValue.id
        ).user_exten,
        fullname: agents?.find((agent) => agent.id === values.failoverValue.id)
          .fullname,
      };
    } else {
      return values.failoverValue;
    }
  };

  const handleSubmitForm = async (values, props) => {
    if (isIvrTreeValid) {
      const postData = {
        name: values.name,
        config: ivrArr.map((item) => {
          if (item.action == TRANSFER_TO_AGENT) {
            item.actionValue.fullname = agents?.find(
              (agent) => agent.id === item.actionValue.id
            ).fullname;
            item.actionValue.user_exten = agents?.find(
              (agent) => agent.id === item.actionValue.id
            ).user_exten;
          }
          if (item.action === TRANSFER_TO_EXTERNAL_NUMBER) {
            item.actionValue = new PhoneNumber(
              item.actionValue,
              "US"
            ).getNumber();
          }

          if (item.failoverAction === TRANSFER_TO_EXTERNAL_NUMBER) {
            item.failoverValue = new PhoneNumber(
              item.failoverValue,
              "US"
            ).getNumber();
          }
          if (item.failoverAction === TRANSFER_TO_AGENT) {
            item.failoverValue.fullname = agents?.find(
              (agent) => agent.id === item.failoverValue.id
            ).fullname;
            item.failoverValue.user_exten = agents?.find(
              (agent) => agent.id === item.failoverValue.id
            ).user_exten;
          }
          return item;
        }),
        general_failover: {
          failoverTime: values.failoverTime,
          failoverAction: values.failoverAction,
          failoverValue: handlefailoverValue(values),
        },
      };
      try {
        if (!id) await createIvr.addNewIvr(postData);
        else await createIvr.updateIvr({ id, data: postData });

        notification.showSuccess(
          `Ivr was ${id ? "updated" : "added"} successfully`
        );
        queryClient.invalidateQueries("fetchIvr");
        history.goBack();
        setTimeout(() => {
          notification.hideNotification();
        }, 2500);
      } catch (error) {
        notification.showError(
          `An unexpected error occurred while attempting to ${
            id ? "update" : "create"
          } Ivr.`
        );
        setTimeout(() => {
          notification.hideNotification();
          history.goBack();
        }, 3000);
      }
    }
    resetAudio();
  };

  useEffect(() => {
    if (id && createIvr.ivr) {
      setIvrArr(
        createIvr.ivr.config_json.map((item) => {
          if (item.action === TRANSFER_TO_EXTERNAL_NUMBER) {
            item.actionValue = ayt.reset(normalizeNumber(item.actionValue));
          }
          return item;
        })
      );
    }
  }, [id, createIvr.ivr]); // eslint-disable-line react-hooks/exhaustive-deps

  const initialValues = useMemo(() => {
    if (ivrInfo) {
      const {
        name,
        general_failover: { failoverTime, failoverAction, failoverValue },
        config_json,
      } = ivrInfo;
      setIvrArr(
        config_json.map((item) => {
          if (item.action === TRANSFER_TO_EXTERNAL_NUMBER) {
            item.actionValue = ayt.reset(
              new PhoneNumber(item.actionValue, "US").getNumber("significant")
            );
          }
          if (item.failoverAction === TRANSFER_TO_EXTERNAL_NUMBER) {
            item.failoverValue = ayt.reset(
              new PhoneNumber(item.failoverValue, "US").getNumber("significant")
            );
          }
          return item;
        })
      );
      return {
        name,
        failoverTime,
        failoverAction,
        failoverValue:
          failoverAction === TRANSFER_TO_EXTERNAL_NUMBER
            ? ayt.reset(
                new PhoneNumber(failoverValue, "US").getNumber("significant")
              )
            : failoverValue,
      };
    } else {
      return {
        name: "",
        failoverTime: "",
        failoverAction: "",
        failoverValue: "",
      };
    }
  }, [ivrInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    resetAudio();
    history.goBack();
  };

  return (
    <Modal
      size="xl"
      header={`${id ? "Edit " : "Create "}IVR`}
      body={
        <div className={styles.container}>
          <p className={styles.subtitle}>Set up interactive voice response.</p>
          <div className="d-flex flex-column justify-content-center">
            <Formik
              initialValues={initialValues}
              onSubmit={handleSubmitForm}
              validationSchema={validationSchema}
              enableReinitialize={true}
            >
              {({ handleChange, isSubmitting, setFieldValue, values }) => (
                <Form>
                  <TextInputField
                    fieldLabel="Name"
                    fieldName="name"
                    disabled={isSubmitting || isFetchingIvr}
                  />
                  {isFetchingIvr || isLoadingAgents || isLoadingGroups ? (
                    <IvrSkeleton />
                  ) : (
                    <IvrTree
                      ayt={ayt}
                      ivrArr={ivrArr}
                      setIvrArr={setIvrArr}
                      ref={ivrTreeRef}
                      validateTree={validateTree}
                    />
                  )}
                  <div style={{ marginTop: "3em" }} className="d-flex">
                    <Grid
                      container
                      spacing={1}
                      className={styles.transferInstructionsContainer}
                    >
                      <Grid item xs={4}>
                        <TextInputField
                          fieldLabel="TIMEOUT (IN SECONDS)"
                          fieldName="failoverTime"
                          disabled={isSubmitting}
                          type="number"
                          min={0}
                          step={5}
                          mt={1}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <SelectField
                          placeholder="Select"
                          disabled={isSubmitting || isFetchingIvr}
                          mt={1}
                          fieldLabel="ACTION IN CASE OF NO INPUT FROM USER"
                          fieldName="failoverAction"
                          onChange={(event) => {
                            handleChange(event);
                            setFieldValue("failoverValue", "");
                          }}
                          options={falioverActionTypes
                            .filter(({ value }) => value !== REPEAT_IVR)
                            .map((action) => (
                              <MenuItem key={action.value} value={action.value}>
                                {action.label}
                              </MenuItem>
                            ))}
                        />
                      </Grid>
                      {values.failoverAction !== REPEAT_IVR &&
                        values.failoverAction !== VOICEMAIL && (
                          <Grid item xs={4}>
                            {values.failoverAction !==
                            TRANSFER_TO_EXTERNAL_NUMBER ? (
                              <AutoCompleteInputField
                                classes={{
                                  popupIndicator: classes.popupIndicator,
                                }}
                                placeholder="Select"
                                disabled={
                                  isSubmitting ||
                                  isFetchingIvr ||
                                  values.failoverAction === ""
                                }
                                mt={1}
                                fieldLabel={`TRANSFER TO ${
                                  values.failoverAction === TRANSFER_TO_AGENT
                                    ? "AGENT"
                                    : values.failoverAction === TRANSFER_TO_TEAM
                                    ? "GROUP"
                                    : ""
                                }`}
                                fieldName="failoverValue"
                                onChangeInput={() => {
                                  return;
                                }}
                                getOptionLabel={({ id }) =>
                                  values.failoverAction === TRANSFER_TO_AGENT
                                    ? getAgentById(id)?.fullname
                                    : getCallGroupById(id)?.name
                                }
                                renderOption={({ id }) =>
                                  values.failoverAction ===
                                  TRANSFER_TO_AGENT ? (
                                    <div>
                                      {getAgentById(id)?.mac_address ? (
                                        <HardwarePhoneIcon
                                          className="me-2"
                                          width={18}
                                          height={18}
                                          fill="#566F9F"
                                        />
                                      ) : null}
                                      {getAgentById(id)?.fullname}
                                    </div>
                                  ) : (
                                    getCallGroupById(id)?.name
                                  )
                                }
                                suggestions={
                                  values.failoverAction === TRANSFER_TO_AGENT
                                    ? agents?.map(({ id }) => {
                                        return {
                                          id,
                                        };
                                      })
                                    : callGroups?.map(({ id }) => {
                                        return { id };
                                      })
                                }
                              />
                            ) : (
                              <TextInputField
                                variant="outlined"
                                maxLength={14}
                                disabled={isSubmitting || isFetchingIvr}
                                onChange={(event) => {
                                  const transformed =
                                    event.target.value !== ""
                                      ? ayt.reset(
                                          normalizeNumber(event.target.value)
                                        )
                                      : "";
                                  setFieldValue("failoverValue", transformed);
                                }}
                                mt={1}
                                fieldLabel="TRANSFER TO NUMBER"
                                fieldName="failoverValue"
                                placeholder="Number"
                              />
                            )}
                          </Grid>
                        )}
                    </Grid>
                  </div>
                  <div className="mt-5 d-flex justify-content-between">
                    <Button
                      className="me-auto primary-btn"
                      variant="outlined"
                      disabled={isSubmitting}
                      color="primary"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="secondary-btn"
                      variant="contained"
                      disabled={isSubmitting || isFetchingIvr}
                      color="secondary"
                      style={{ width: "auto" }}
                      onClick={() => validateTree(ivrTree)}
                    >
                      {isSubmitting
                        ? `${id ? "Updating" : "Creating"} IVR`
                        : `${id ? "Update" : "Create"} IVR`}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      }
      onClose={handleClose}
      footer={null}
    />
  );
};

export default observer(CreateIvr);

const IvrTree = observer(
  forwardRef(({ ayt, ivrArr, setIvrArr }, ref) => {
    const { id } = useParams();
    useEffect(() => {
      if (!id) addNewRow();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
    const classes = useStyles();
    const {
      ivrSettings,
      notification,
      createIvr,
      incomingCalls: incomingCallsStore,
    } = useStores();

    const { data: agents, isLoading: isLoadingAgents } = useQuery(
      "usersAlongWithIncomingCalls",
      () => incomingCallsStore.getUsers(),
      {
        onError: (err) => {
          notification.showError(err.message);
        },
      }
    );

    const getAgentById = (agentId) =>
      agents?.find((agent) => agent.id === agentId);

    const { data: callGroups, isLoading: isLoadingGroups } = useQuery(
      ["fetchGroups"],
      () => ivrSettings.fetchGroups(),
      {
        onError: (err) => {
          notification.showError(err.message);
        },
      }
    );

    const getCallGroupById = (groupId) =>
      callGroups?.find((group) => group.id === groupId);

    useEffect(() => {
      const newIvrArr = cloneDeep(ivrArr);
      createIvr.setIvrTree(newIvrArr);
    }, [ivrArr]); // eslint-disable-line react-hooks/exhaustive-deps

    const addNewRow = (parent = "", audio = false) => {
      const childLength = ivrArr.filter((ivr) => ivr.parent === parent).length;
      if (childLength >= 9) return;
      setIvrArr((prev) => {
        const state = audio ? createIvr.initialState : createIvr.newState;
        return [...prev, { ...state, id: nanoid(), parent }];
      });
    };

    const removeRow = (id) => {
      setIvrArr((prev) => prev.filter((i) => i.id !== id && i.parent !== id));
    };

    const handleInputChange = (e, parent, id) => {
      const name = e.target.name;
      let value = e.target.value;
      manageIvrTree(name, value, id, parent);
    };

    const manageIvrTree = (name, value, id, parent) => {
      let obj = ivrArr.find((i) => i.parent === parent && i.id === id);
      const index = ivrArr.findIndex((i) => i.parent === parent && i.id === id);

      if (obj && index !== -1) {
        if (
          name === "actionValue" &&
          obj.action === TRANSFER_TO_EXTERNAL_NUMBER
        ) {
          value = ayt.reset(normalizeNumber(value));
        }
        if (
          name === "failoverValue" &&
          obj.failoverAction === TRANSFER_TO_EXTERNAL_NUMBER
        ) {
          value = ayt.reset(normalizeNumber(value));
        }

        if (name === "action" && value === TRANSFER_TO_EXTERNAL_NUMBER)
          obj = { ...obj, actionValue: "" };

        if (name === "failoverAction" && value === TRANSFER_TO_EXTERNAL_NUMBER)
          obj = { ...obj, failoverValue: "" };

        if (name === "failoverTime")
          obj = { ...obj, failoverTime: parseInt(obj.failoverTime) };

        obj = { ...obj, [name]: value };

        const newIvrArr = ivrArr;
        newIvrArr[index] = obj;
        setIvrArr([...newIvrArr]);
      }

      if (name === "action" && value === TRANSFER_TO_IVR) addNewRow(id, true);
      if (name === "action" && value !== TRANSFER_TO_IVR)
        setIvrArr((prev) => prev.filter((i) => i.parent !== id));
    };

    const handleAudioChange = (parent, id, audio) => {
      let obj = ivrArr.find((i) => i.parent === parent && i.id === id);
      const index = ivrArr.findIndex((i) => i.parent === parent && i.id === id);

      if (obj && index !== -1) {
        obj = { ...obj, audio };
        const newIvrArr = ivrArr;
        newIvrArr[index] = obj;
        setIvrArr([...newIvrArr]);
      }
    };

    const occupiedKeysArr = (parent, id) =>
      ivrArr.filter((ivr) => ivr.parent === parent).map((ivr) => ivr.key);

    const renderKeySelection = (ivr) => (
      <Select
        fullWidth
        style={{ textAlign: "center" }}
        className={classes.root}
        variant="outlined"
        name="key"
        value={ivr.key}
        onChange={(e) => handleInputChange(e, ivr.parent, ivr.id)}
      >
        <MenuItem value="none" disabled>
          Select
        </MenuItem>
        {ivrKeys.map((key) => (
          <MenuItem
            key={key}
            value={key}
            disabled={occupiedKeysArr(ivr.parent, ivr.id).includes(key)}
          >
            {key}
          </MenuItem>
        ))}
      </Select>
    );

    const renderIvrTree = (ivr, index) => (
      <div
        className={clsx(styles.mainContainer, "containerBorder")}
        key={ivr.id}
        id={`id-${ivr.id}`}
      >
        {"audio" in ivr && (
          <VoiceFile ivr={ivr} handleAudioChange={handleAudioChange} />
        )}
        {!("audio" in ivr) && index === 1 && (
          <Grid container>
            <Grid item xs={1}>
              <label className={styles.ivrLabels}>Key</label>
            </Grid>
            <Grid item xs={ivr.action === TRANSFER_TO_IVR ? 11 : 2}>
              <label className={styles.ivrLabels}>
                {ivr.action === TRANSFER_TO_IVR ? "IVR" : "Action"}
              </label>
            </Grid>
            {ivr.action !== TRANSFER_TO_IVR && (
              <>
                <Grid item xs={3}>
                  <label className={styles.ivrLabels}>Action Value</label>
                </Grid>
                <Grid item xs={1}>
                  <label className={styles.ivrLabels}>Timeout (s)</label>
                </Grid>
                <Grid
                  item
                  xs={
                    ivr.failoverAction === VOICEMAIL ||
                    ivr.failoverAction === REPEAT_IVR
                      ? 5
                      : 2
                  }
                >
                  <label className={styles.ivrLabels}>Timeout Action</label>
                </Grid>
                {ivr.failoverAction !== VOICEMAIL &&
                  ivr.failoverAction !== REPEAT_IVR && (
                    <Grid item xs={3}>
                      <label className={styles.ivrLabels}>Timeout Value</label>
                    </Grid>
                  )}
              </>
            )}
          </Grid>
        )}
        {!("audio" in ivr) && (
          <Grid container className={styles.transferInstructionsContainer}>
            <Grid item xs={1} className={styles.transferInstructionsKey}>
              {renderKeySelection(ivr)}
            </Grid>
            <Grid
              item
              xs={ivr.action === TRANSFER_TO_IVR ? 11 : 2}
              className={clsx(
                styles.transferInstructionsName,
                ivr.action === TRANSFER_TO_IVR && styles.ivrChildButtonContainer
              )}
            >
              <Select
                fullWidth={true}
                className={classes.root}
                variant="outlined"
                name="action"
                value={ivr.action}
                onChange={(e) => handleInputChange(e, ivr.parent, ivr.id)}
              >
                <MenuItem disabled value="none">
                  Select
                </MenuItem>
                {actionTypes.map((action) => (
                  <MenuItem key={action.value} value={action.value}>
                    {action.label}
                  </MenuItem>
                ))}
              </Select>
              {ivr.action === TRANSFER_TO_IVR && (
                <>
                  <span
                    className={styles.plus_red_small}
                    onClick={() => addNewRow(ivr.id)}
                  >
                    +
                  </span>
                  {index > 0 && (
                    <span
                      className={styles.minus_white}
                      onClick={() => removeRow(ivr.id)}
                    >
                      -
                    </span>
                  )}
                </>
              )}
            </Grid>
            {ivr.action !== TRANSFER_TO_IVR && (
              <Grid
                item
                xs={3}
                className={clsx(
                  styles.transferInstructionsName,
                  index > 0 && styles.ivrChildButtonContainer
                )}
              >
                {ivr.action !== TRANSFER_TO_EXTERNAL_NUMBER ? (
                  <Autocomplete
                    classes={{ popupIndicator: classes.popupIndicator }}
                    style={{ padding: "0px 10px" }}
                    fullWidth
                    disabled={ivr.action === "none" || !ivr.action}
                    value={ivr.actionValue}
                    name="actionValue"
                    options={
                      ivr.action === TRANSFER_TO_AGENT
                        ? agents?.map(({ id }) => {
                            return {
                              id,
                            };
                          })
                        : callGroups?.map(({ id }) => {
                            return { id };
                          })
                    }
                    onChange={(event, newValue) => {
                      if (newValue) {
                        manageIvrTree(
                          "actionValue",
                          newValue,
                          ivr.id,
                          ivr.parent
                        );
                      } else {
                        manageIvrTree("actionValue", "", ivr.id, ivr.parent);
                      }
                    }}
                    getOptionLabel={({ id }) =>
                      ivr.action === TRANSFER_TO_AGENT
                        ? getAgentById(id)?.fullname
                        : getCallGroupById(id)?.name
                    }
                    renderOption={({ id }) =>
                      ivr.action === TRANSFER_TO_AGENT ? (
                        <div>
                          {getAgentById(id)?.mac_address ? (
                            <HardwarePhoneIcon
                              className="me-2"
                              width={18}
                              height={18}
                              fill="#566F9F"
                            />
                          ) : null}
                          {getAgentById(id)?.fullname}
                        </div>
                      ) : (
                        getCallGroupById(id)?.name
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        style={{ background: "transparent" }}
                        name="actionValue"
                        variant="standard"
                        placeholder={`Select ${
                          ivr.action === TRANSFER_TO_AGENT
                            ? "Agent"
                            : ivr.action === TRANSFER_TO_TEAM
                            ? "Group"
                            : ""
                        }`}
                        InputProps={{
                          ...params.InputProps,
                          disableUnderline: true,
                        }}
                      />
                    )}
                  />
                ) : (
                  <div className="d-flex align-items-center h-100 ms-2">
                    <TextField
                      variant="outlined"
                      inputProps={{
                        maxLength: 14,
                        style: {
                          padding: 0,
                          height: 32,
                          width: 120,
                          paddingLeft: 12,
                        },
                      }}
                      name="actionValue"
                      value={ivr.actionValue}
                      onChange={(e) => handleInputChange(e, ivr.parent, ivr.id)}
                    />
                  </div>
                )}
              </Grid>
            )}
            {ivr.action !== TRANSFER_TO_IVR && (
              <>
                <Grid
                  item
                  xs={1}
                  className={clsx(
                    styles.transferInstructionsName,
                    index > 0 && styles.ivrChildButtonContainer
                  )}
                >
                  <TextField
                    style={{ width: "100%" }}
                    size="small"
                    title="Failover Time"
                    placeholder="Select"
                    variant="outlined"
                    className={classes.root}
                    inputProps={{
                      type: "number",
                      min: 10,
                      step: 5,
                      max: 300,
                      style: { textAlign: "center" },
                    }}
                    name="failoverTime"
                    value={ivr.failoverTime}
                    onChange={(e) => handleInputChange(e, ivr.parent, ivr.id)}
                  />
                </Grid>
                <Grid
                  item
                  xs={
                    ivr.failoverAction === VOICEMAIL ||
                    ivr.failoverAction === REPEAT_IVR
                      ? 5
                      : 2
                  }
                  className={clsx(
                    styles.transferInstructionsName,
                    index > 0 && styles.ivrChildButtonContainer
                  )}
                >
                  <Select
                    style={{
                      width:
                        ivr.failoverAction === VOICEMAIL ||
                        ivr.failoverAction === REPEAT_IVR
                          ? "90%"
                          : "100%",
                    }}
                    className={classes.root}
                    variant="outlined"
                    name="failoverAction"
                    value={ivr.failoverAction}
                    onChange={(e) => handleInputChange(e, ivr.parent, ivr.id)}
                  >
                    <MenuItem disabled value="none">
                      Select
                    </MenuItem>
                    {falioverActionTypes.map((action) => (
                      <MenuItem key={action.value} value={action.value}>
                        {action.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {index > 0 &&
                    (ivr.failoverAction === VOICEMAIL ||
                      ivr.failoverAction === REPEAT_IVR) && (
                      <span
                        className={styles.minus_white}
                        onClick={() => removeRow(ivr.id)}
                      >
                        -
                      </span>
                    )}
                </Grid>
                {ivr.failoverAction !== VOICEMAIL &&
                  ivr.failoverAction !== REPEAT_IVR && (
                    <Grid
                      style={{
                        borderRadius: "0px 4px 4px 0px",
                      }}
                      item
                      xs={3}
                      className={clsx(
                        styles.transferInstructionsName,
                        index > 0 && styles.ivrChildButtonContainer
                      )}
                    >
                      {ivr.failoverAction === TRANSFER_TO_AGENT ||
                      ivr.failoverAction === TRANSFER_TO_TEAM ||
                      ivr.failoverAction === "none" ? (
                        <Autocomplete
                          classes={{ popupIndicator: classes.popupIndicator }}
                          style={{ width: "90%", padding: "0px 10px" }}
                          disabled={
                            ivr.failoverAction === "none" || !ivr.failoverAction
                          }
                          value={ivr.failoverValue}
                          name="failoverValue"
                          options={
                            ivr.failoverAction === TRANSFER_TO_AGENT
                              ? agents?.map(({ id }) => {
                                  return {
                                    id,
                                  };
                                })
                              : callGroups?.map(({ id }) => {
                                  return { id };
                                })
                          }
                          renderOption={({ id }) =>
                            ivr.failoverAction === TRANSFER_TO_AGENT ? (
                              <div>
                                {getAgentById(id)?.mac_address ? (
                                  <HardwarePhoneIcon
                                    className="me-2"
                                    width={18}
                                    height={18}
                                    fill="#566F9F"
                                  />
                                ) : null}
                                {getAgentById(id)?.fullname}
                              </div>
                            ) : (
                              getCallGroupById(id)?.name
                            )
                          }
                          onChange={(event, newValue) => {
                            if (newValue) {
                              manageIvrTree(
                                "failoverValue",
                                newValue,
                                ivr.id,
                                ivr.parent
                              );
                            } else {
                              manageIvrTree(
                                "failoverValue",
                                "",
                                ivr.id,
                                ivr.parent
                              );
                            }
                          }}
                          getOptionLabel={({ id }) =>
                            ivr.failoverAction === TRANSFER_TO_AGENT
                              ? getAgentById(id)?.fullname
                              : getCallGroupById(id)?.name
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              style={{ background: "transparent" }}
                              name="failoverValue"
                              variant="standard"
                              placeholder={`Select ${
                                ivr.failoverAction === TRANSFER_TO_AGENT
                                  ? "Agent"
                                  : ivr.failoverAction === TRANSFER_TO_TEAM
                                  ? "Group"
                                  : ""
                              }`}
                              InputProps={{
                                ...params.InputProps,
                                disableUnderline: true,
                              }}
                            />
                          )}
                        />
                      ) : (
                        <div className="d-flex align-items-center h-100 ms-2">
                          <TextField
                            variant="outlined"
                            inputProps={{
                              maxLength: 14,
                              style: {
                                padding: 0,
                                height: 32,
                                width: 120,
                                paddingLeft: 12,
                              },
                            }}
                            name="failoverValue"
                            value={ivr.failoverValue}
                            onChange={(e) =>
                              handleInputChange(e, ivr.parent, ivr.id)
                            }
                          />
                        </div>
                      )}
                      {index > 0 && (
                        <span
                          className={styles.minus_white}
                          onClick={() => removeRow(ivr.id)}
                        >
                          -
                        </span>
                      )}
                    </Grid>
                  )}
              </>
            )}
          </Grid>
        )}
        {ivr.action === TRANSFER_TO_IVR && ivr.children.length > 0 && (
          <div className={styles.subContainer}>
            {ivr.children.map((childIvr, childIndex) =>
              renderIvrTree(childIvr, childIndex)
            )}
          </div>
        )}
      </div>
    );

    return (
      <div ref={ref}>
        <div className="mt-3 mb-3 d-flex justify-content-end">
          <Fab
            size="small"
            color="secondary"
            aria-label="add"
            onClick={() => addNewRow()}
          >
            <AddIcon />
          </Fab>
        </div>
        {createIvr.ivrTree.map((ivr, index) => renderIvrTree(ivr, index))}
      </div>
    );
  })
);

IvrTree.displayName = "IvrTree";

const VoiceFile = observer(({ ivr, handleAudioChange }) => {
  const [addNewIvrVoiceDialog, setAddNewIvrVoiceDialog] = useState(false);
  const [ivrAudioUrl, setIvrAudioUrl] = useState("");

  const { phoneFaxIVRVoicemailGreeting, utils } = useStores();
  const authToken = useAuthToken();

  useEffect(() => {
    if (ivrAudioUrl) handleAudioChange(ivr.parent, ivr.id, ivrAudioUrl);
  }, [ivrAudioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const setSelectedFile = (file) => handleAudioChange(ivr.parent, ivr.id, file);

  const handleGreetingPlay = async (uuid, shouldPlay) => {
    if (uuid !== phoneFaxIVRVoicemailGreeting.currentlyPlaying.uuid) {
      if (phoneFaxIVRVoicemailGreeting.currentlyPlaying.uuid !== null) {
        if (phoneFaxIVRVoicemailGreeting.currentlyPlaying.file !== null) {
          phoneFaxIVRVoicemailGreeting.currentlyPlaying.file.pause();
          phoneFaxIVRVoicemailGreeting.setCurrentlyPlaying({
            uuid: null,
            shouldPlay: false,
          });
        }
      }
    }

    phoneFaxIVRVoicemailGreeting.setCurrentlyPlaying({
      uuid,
      shouldPlay,
    });

    if (shouldPlay) {
      const audioFile = new Audio(utils.prepareMediaUrl({ uuid, authToken }));
      audioFile.play();
      phoneFaxIVRVoicemailGreeting.setCurrentlyPlaying({
        file: audioFile,
      });
      audioFile.addEventListener("ended", () => {
        phoneFaxIVRVoicemailGreeting.setCurrentlyPlaying({
          uuid: null,
          shouldPlay: false,
          downloadUrl: null,
          file: null,
        });
      });
    } else {
      phoneFaxIVRVoicemailGreeting.currentlyPlaying.file.pause();
      phoneFaxIVRVoicemailGreeting.setCurrentlyPlaying({
        uuid: null,
        shouldPlay: false,
        downloadUrl: null,
        file: null,
      });
    }
  };

  const handleClick = () => setAddNewIvrVoiceDialog(true);

  return (
    <>
      {ivr.audio ? (
        <div className={styles.audioContainer}>
          <span className="d-flex align-items-center ">
            {ivr.audio.uuid ===
              phoneFaxIVRVoicemailGreeting.currentlyPlaying.uuid &&
            phoneFaxIVRVoicemailGreeting.currentlyPlaying.shouldPlay ? (
              <PauseCircleFilledIcon
                className={styles.playPause}
                onClick={() => handleGreetingPlay(ivr.audio.uuid, false)}
              />
            ) : (
              <PlayCircleFilledIcon
                className={styles.playPause}
                onClick={() => handleGreetingPlay(ivr.audio.uuid, true)}
              />
            )}
            <div className={styles.ivr_name}>{ivr.audio.name}</div>
          </span>
          <span className={styles.icon_sec_audio}>
            <PencilIcon
              fill="#9A9A9A"
              style={{
                width: "1rem",
                height: "1rem",
                marginRight: "0.5rem",
                cursor: "pointer",
              }}
              onClick={() => setAddNewIvrVoiceDialog(true)}
            />
            <DeleteIcon
              style={{ fill: "#999999", cursor: "pointer" }}
              onClick={() => setSelectedFile("")}
            />
          </span>
        </div>
      ) : (
        <div className={styles.uploadContainerEmpty} onClick={handleClick}>
          <CloudUpload height={20} width={20} />
          <center className="ms-2">
            <div className={styles.uploadInstructions}>
              <span className={styles.highlight}>
                Click here to add a Voice File
              </span>
            </div>
          </center>
        </div>
      )}
      {addNewIvrVoiceDialog && (
        <AddNewIvrVoiceFile
          onClose={() => {
            phoneFaxIVRVoicemailGreeting.currentlyPlaying.file &&
              phoneFaxIVRVoicemailGreeting.currentlyPlaying.file.pause();
            phoneFaxIVRVoicemailGreeting.setCurrentlyPlaying({
              uuid: null,
              shouldPlay: false,
              downloadUrl: null,
              file: null,
            });
            setAddNewIvrVoiceDialog(false);
          }}
          greetingStore={phoneFaxIVRVoicemailGreeting}
          onAudioFileSelection={(file) => setSelectedFile(file)}
        />
      )}
    </>
  );
});
