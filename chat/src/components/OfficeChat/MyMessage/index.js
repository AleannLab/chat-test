import React, { useEffect, useState } from 'react';
import { Grid, IconButton } from '@material-ui/core';
import { Done, DoneAll } from '@material-ui/icons';
import { format } from 'date-fns';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Reaction from '../Reaction';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';
import { MessageReply } from 'components/ChatMessengers/MessageReply';

const MyMessage = ({ message, message: { reactions }, avatar }) => {
  const { kittyOfficeChat } = useStores();
  const [status, setStatus] = useState(false);

  const getStatus = async () => {
    const readReceipts = await kittyOfficeChat.getListMessageReadReceipts(
      message.id,
    );
    if (readReceipts.status === 200) {
      setStatus(readReceipts.data.page?.totalElements > 0);
    } else {
      setStatus(false);
    }
  };
  useEffect(() => {
    getStatus();
  }, [message]);

  return (
    <div className={styles.messageRow}>
      <div className={styles.messageContent}>
        <Grid container style={{ display: 'flex' }}>
          <Grid
            item
            xs={11}
            style={{
              padding: '0px 14px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className={styles.messageInfoWrapper}>
              <div className={styles.messageStatus}>
                {status ? <DoneAll /> : <Done />}
              </div>
              <div className={styles.messageTime}>
                <>{format(new Date(message.createdTime), 'h:mm a')}</>
              </div>
            </div>
            <div key={message.id} className={styles.messageTextWrapper}>
              <div className={styles.messageText}>
                {message.nestedLevel && <MessageReply message={message} />}
                {message.body}
              </div>
              {/* <IconButton style={{ backgroundColor: 'white' }}>
                <MoreHorizIcon />
              </IconButton> */}
              <div className={styles.reactionsWrapper}>
                <div className={styles.reactions}>
                  {reactions &&
                    reactions.map((reaction, i) => {
                      return (
                        <Reaction
                          key={i}
                          reaction={reaction}
                          disabledClick={true}
                        />
                      );
                    })}
                </div>
              </div>
            </div>
          </Grid>
          <Grid
            item
            xs={1}
            className="d-flex align-items-start"
            style={{ justifyContent: 'center', paddingTop: '10px' }}
          >
            {avatar}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default MyMessage;
