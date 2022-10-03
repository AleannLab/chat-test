import React, { useContext, useState } from 'react';
import styles from './index.module.css';
import MentionInputField from './MentionInputFieldEdit';
import { Button } from '@material-ui/core';
import  Trash from '../../../assets/images/delete.svg';
import { utilizeFocus } from './utilizeFocus';
import {
  replaceBackMessageSpecialCharacters,
  VariableContext,
} from '../variableContext';

export const AddResponse = ({
  onClose,
  actionRapidReplies,
  deleteRapidReplies,
  item = '',
}) => {
  const [message, setMessage] = useState(item);
  const variables = useContext(VariableContext);
  const ChatFocus = utilizeFocus();

  const onSave = () => {
    onClose();
    actionRapidReplies(replaceBackMessageSpecialCharacters(message));
  };

  const onDelete = () => {
    deleteRapidReplies();
    onClose();
  };

  const onCancel = () => {
    onClose();
  };

  const OnInputHandle = (value) => {
    setMessage(value);
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <span className={styles.textAddResponses}>
        {'Please type your rapid replies below. Start typing'} <br />
        {'{ } to select and include variables.'}
      </span>
      <div className={styles.textareaLabel}>
        <span>Message (160 characters recommended for SMS with spaces)</span>
        <span>{message.length} / 160</span>
      </div>
      <MentionInputField
        fieldName="customMessage"
        placeholder="Enter your message..."
        tags={variables}
        value={message}
        onChange={OnInputHandle}
        formattedMessage={(message) => message}
        refProps={ChatFocus.ref}
        showCharCount={false}
        focused={false}
      />
      <div className={styles.buttonsAddResponses}>
        <Button
          className="primary-btn me-auto"
          variant="outlined"
          color="primary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <div className={styles.buttonsAddResponses_groupButtons}>
          {item && (
            <Button
              className="primary-btn me-auto"
              variant="outlined"
              color="primary"
              onClick={onDelete}
            >
              <Trash className={styles.buttonsAddResponses_trash} />
              Delete
            </Button>
          )}
          <Button
            disabled={!message.length}
            type="submit"
            className="secondary-btn"
            variant="contained"
            color="secondary"
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
