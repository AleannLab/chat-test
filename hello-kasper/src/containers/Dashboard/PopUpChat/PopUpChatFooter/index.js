import React, { useRef } from 'react';
import InputBox from 'components/Messages/InputBox';
import { Reply } from 'components/Messages/Reply';
import styles from './index.module.css';

const PopUpChatFooter = ({
  isSelect,
  sendChatMessageToChannel,
  replayedMessage,
  handleCancel,
}) => {
  const inputBoxRef = useRef(null);
  if (!isSelect) {
    return null;
  }
  return (
    <>
      {replayedMessage && (
        <Reply replayedMessage={replayedMessage} handleCancel={handleCancel} />
      )}
      <InputBox
        ref={inputBoxRef}
        onSubmit={(value, props) => sendChatMessageToChannel(value, props)}
        shouldDisable={false}
        canText={true}
      />
    </>
  );
};

export { PopUpChatFooter };
