import { useState } from 'react';
import styles from './index.module.css';
import { Phone } from './Phone';
import { RapidRepliesBar } from './RapidRepliesBar';

export const ChatBarContainer = ({
  handleSubmit,
  setFieldValue,
  focusedChat,
  unfocusedChat,
}) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div
      style={{
        top: isOpened ? '-236px' : '-31px',
        height: isOpened ? '235px' : '30px',
      }}
      className={styles.container}
    >
      {/* <Phone /> */}
      <RapidRepliesBar
        setIsOpened={setIsOpened}
        isOpened={isOpened}
        handleSubmit={handleSubmit}
        setFieldValue={setFieldValue}
        focusedChat={focusedChat}
        unfocusedChat={unfocusedChat}
      />
    </div>
  );
};
