import React, { useRef } from 'react';
import { Formik } from 'formik';
import { IconButton } from '@material-ui/core';

import Comment from 'assets/images/chat-comment.svg';
import Send from 'assets/images/send.svg';
import styles from './index.module.css';

const CommentField = (props) => {
  const inputEl = useRef(null);
  const auto_height = (elem) => {
    elem.style.height = '1px';
    elem.style.height = elem.scrollHeight + 'px';
  };

  const handleInputKeyEvent = (e, props) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.value) {
      props.handleSubmit();
      setTimeout(() => {
        props.setFieldValue('chat', '');
      }, 0);
    }
  };

  return (
    <Formik initialValues={{ chat: '' }} onSubmit={props.onSubmit}>
      {(props) => (
        <form
          onSubmit={props.handleSubmit}
          onKeyDown={(e) => handleInputKeyEvent(e, props)}
        >
          {console.log('props formik', props)}
          <div
            className={`${styles.chatContainer} px-4`}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 50,
            }}
          >
            <img
              src={Comment}
              alt="Comment Icon"
              style={{ margin: '0px 12px 0px 4px' }}
            />

            <div className="mx-1 flex-grow-1">
              <textarea
                type="text"
                onChange={(e) => props.setFieldValue('chat', e.target.value)}
                value={props.values.chat}
                rows="1"
                placeholder="Add a comment..."
                className={styles.chatTextarea}
                onInput={auto_height}
              ></textarea>
            </div>

            <div className={styles.actionButton}>
              <IconButton
                ref={inputEl}
                aria-label="delete"
                type="submit"
                disabled={!props.values.chat}
              >
                <img
                  src={Send}
                  alt="Add Attachment"
                  style={{ height: '17px', width: '17px' }}
                />
              </IconButton>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default CommentField;
