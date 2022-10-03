import React, { useRef, forwardRef, useState, useEffect } from "react";
import styles from "./index.module.css";
import clsx from "clsx";
import SendIcon from "assets/images/send.svg";
import { Formik } from "formik";
import { IconButton } from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
import { ChatBarContainer } from "../ContainerOptionsChat/ChatBarContainer";
import MentionInputField from "./MentionInputFieldEdit";
import { replaceVariables } from "stores/utils/replaceVariables";
import { useStores } from "hooks/useStores";
import {
  BASE_VARIABLES,
  getOsLink,
  replaceBackMessageSpecialCharacters,
  VariableBuilder,
  VariableContext,
} from "../variableContext";
import { ButtonEmoji } from "../ButtonEmoji";

// TODO: KAS-637 - Hide audio and attachment buttons from chat input box */
// import Attach from "assets/images/attachment.svg";
// import Audio from "assets/images/audio.svg";

const utilizeFocus = () => {
  const ref = React.createRef();
  const setFocus = () => {
    ref.current && ref.current.focus();
  };

  return { setFocus, ref };
};

export const VariablesSuggestionItem = ({ focused, variable, description }) => {
  return (
    <li className={styles.constantsItems}>
      <div
        onClick={() => {}}
        className={clsx(
          styles.constantsItems_button,
          focused && styles.constantsItems_button_focused
        )}
      >
        {focused && <div className={styles.constantsItems_marker}></div>}
        <span className={styles.constantsItems_variable}>{variable}</span>
        <span className={styles.constantsItems_description}>{description}</span>
      </div>
    </li>
  );
};

export const VariablesSuggestionContainer = ({ items }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>Patient Variables</span>
      </div>
      <div className={styles.containerVariables}>
        <ul className={styles.list}>{items}</ul>
      </div>
    </div>
  );
};

const InputBox = (
  { isEmoji = true, enableRapidReplies = true, ...props },
  ref
) => {
  const inputEl = useRef(null);
  const [positionFocus, setPositionFocus] = useState(null);
  const shouldDisable = props.shouldDisable;
  const [focused, setFocused] = useState(false);
  const { patientsFeed, officeProfile } = useStores();
  const ChatFocus = utilizeFocus();

  useEffect(() => {
    officeProfile.fetchData();
  }, [officeProfile]);

  const handleInputKeyEvent = (e, props) => {
    const inputValue = e.target.value ?? e.target.value?.trim();
    if (e.key === "Enter" && !e.shiftKey && inputValue && inputValue.length) {
      props.setFieldValue(
        "chat",
        replaceVariables(props.values.chat, variables)
      );
      props.handleSubmit();
      setTimeout(() => {
        props.setFieldValue("chat", "");
      }, 0);
    }
  };
  const [variables, setVariables] = useState([]);

  const onChange = (e) => {
    let value = e.target.value;
  };

  const focusedChat = () => {
    setFocused(true);
  };

  const unfocusedChat = () => {
    setFocused(false);
  };

  return (
    <VariableContext.Provider value={variables}>
      {!props.canText && (
        <div className={styles.warningContainer}>
          <ErrorIcon className={styles.errorIcon} />
          <span className={styles.warningText}>
            This patient has opted out of SMS and will not receive automated
            messages or reminders.
          </span>
        </div>
      )}
      <Formik initialValues={{ chat: "" }} onSubmit={props.onSubmit}>
        {(props) => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              props.setFieldValue(
                "chat",
                replaceVariables(
                  replaceBackMessageSpecialCharacters(props.values.chat),
                  variables
                )
              );
              props.handleSubmit();
            }}
            onKeyDown={(e) => handleInputKeyEvent(e, props)}
          >
            <div
              className={styles.chatContainer}
              style={{
                display: "flex",
                position: "relative",
                alignItems: "center",
                height: "auto",
              }}
            >
              <div className={styles.containerButton}>
                {/* TODO: KAS-637 - Hide audio and attachment buttons from chat input box */}
                {/* <div className={styles.actionButton}>
                <img
                  src={Audio}
                  alt="Add Attachment"
                  style={{ height: "17px", width: "17px" }}
                />
              </div>
              <div className={styles.actionButton}>
                <img
                  src={Attach}
                  alt="Add Attachment"
                  style={{ height: "17px", width: "17px" }}
                />
              </div> */}
                {isEmoji && (
                  <ButtonEmoji
                    value={props.values.chat}
                    setValue={props.setFieldValue}
                    positionFocus={positionFocus}
                  />
                )}
              </div>
              <MentionInputField
                fieldName="customMessage"
                placeholder={
                  shouldDisable
                    ? "No number available"
                    : "Enter your message..."
                }
                value={props.values.chat}
                onChange={onChange}
                onSelect={(e) => {
                  setPositionFocus(e.target.selectionStart);
                }}
                maxLength={160}
                tags={variables}
                rowsMax={5}
                rowsMin={1}
                refProps={ChatFocus.ref}
                showCharCount={false}
                focused={focused}
                enableRapidReplies={enableRapidReplies}
              />
              {enableRapidReplies && (
                <ChatBarContainer
                  focusedChat={focusedChat}
                  unfocusedChat={unfocusedChat}
                  handleSubmit={props.handleSubmit}
                  setFieldValue={props.setFieldValue}
                />
              )}

              <div className={styles.actionButton}>
                <IconButton
                  ref={inputEl}
                  type="submit"
                  disabled={!props.values.chat.trim().length}
                  style={{ padding: "0" }}
                  className={
                    props.values.chat.trim().length ? styles.sendBtnActive : ""
                  }
                >
                  {!shouldDisable && <SendIcon height="1rem" width="1rem" />}
                </IconButton>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </VariableContext.Provider>
  );
};

export default forwardRef(InputBox);
