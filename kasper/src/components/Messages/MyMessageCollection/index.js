import React from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import { format } from 'date-fns';

const MyMessageCollection = ({ messages, subtitle, avatar }) => {
  return (
    <div className={styles.messageRow}>
      <div className={styles.messageContent}>
        <Grid container style={{ display: 'flex' }}>
          <Grid item xs={11} style={{ padding: ' 0px 14px' }}>
            {messages.map((message) => (
              <div key={message.id} className={styles.messageTextWrapper}>
                <div className={styles.messageText}>{message.text}</div>
              </div>
            ))}
            <div className={styles.messageTime}>
              {subtitle}
              {!subtitle && (
                <>
                  {messages[0].from_did || 'username'},{' '}
                  {format(new Date(messages[0].datetime), 'h:mm a')}
                </>
              )}
            </div>
          </Grid>
          <Grid
            item
            xs={1}
            className="d-flex align-items-end"
            style={{ justifyContent: 'center', paddingBottom: '1.6rem' }}
          >
            {avatar}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default MyMessageCollection;
