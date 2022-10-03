import React from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import ProfileImage from 'assets/images/profile-2.svg';
import Avatar from 'components/Avatar';
import { format } from 'date-fns';
import { observer } from 'mobx-react';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import OpenInNewOutlinedIcon from '@material-ui/icons/OpenInNewOutlined';

const OtherMessageCollection = observer(({ messages, subtitle, avatar }) => {
  const { utils } = useStores();
  const authToken = useAuthToken();

  return (
    <div className={styles.messageRow}>
      <div className={styles.messageContent}>
        <Grid container style={{ display: 'flex' }}>
          <Grid
            item
            xs={1}
            className="d-flex align-items-end"
            style={{ justifyContent: 'center', paddingBottom: '1.6rem' }}
          >
            {avatar ? avatar : <Avatar src={ProfileImage} id={0} />}
          </Grid>
          <Grid item xs={11} style={{ padding: ' 0px 14px' }}>
            {messages.map((message) => (
              <div key={message.id} className={styles.messageTextWrapper}>
                <div className={styles.messageText}>
                  <span>{message.text}</span>
                  <div>
                    {message.media.length > 0 ? (
                      <span>
                        Multimedia Message received, this link will expire in 30
                        days:{' '}
                      </span>
                    ) : null}
                    {message.media.length > 0 ? (
                      <>
                        {message.media.map((medium) => (
                          <a
                            target="_blank"
                            href={utils.prepareMediaUrl({
                              uuid: medium.media_uuid,
                              authToken,
                            })}
                            key={medium.key}
                            rel="noopener noreferrer"
                          >
                            <span>[LINK]</span>
                            <OpenInNewOutlinedIcon
                              className="ms-1 me-2"
                              style={{ fontSize: '1rem' }}
                            />
                          </a>
                        ))}
                      </>
                    ) : null}
                  </div>
                </div>
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
        </Grid>
      </div>
    </div>
  );
});

export default OtherMessageCollection;
