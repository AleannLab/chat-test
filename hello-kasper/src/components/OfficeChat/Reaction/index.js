import React from 'react';
import { useStores } from 'hooks/useStores';

import styles from './index.module.css';
import clsx from 'clsx';

const Reactions = ({ reaction, message, disabledClick = false }) => {
  const { kittyOfficeChat } = useStores();
  const emoji = reaction.emoji.character;

  const removeReaction = async (reaction, message) => {
    const emoji = reaction.emoji.aliases[0];
    const result = await kittyOfficeChat.removeReaction(emoji, message);
    console.log(result);
  };

  return (
    <div
      className={clsx(
        styles.reactionContent,
        disabledClick && styles.reactionContentDisabled,
      )}
      onClick={() => (disabledClick ? null : removeReaction(reaction, message))}
    >
      <div className={styles.reactionEmoji}>{emoji}</div>
      <div className={styles.reactionCount}>{reaction.count}</div>
    </div>
  );
};

export default Reactions;
