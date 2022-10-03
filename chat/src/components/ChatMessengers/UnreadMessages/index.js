import React from 'react';
import styles from './index.module.css';

const UnreadMessages = ({ quantity }) => {
  return (
    <div className={styles.wrapperQuantityMessages}>
      <span>{quantity}</span>
    </div>
  );
};

export { UnreadMessages };
