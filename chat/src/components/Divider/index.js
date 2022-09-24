import React from 'react';
import styles from './index.module.css';

export default function Divider({ children, isBorder = true }) {
  return (
    <div className={styles.container}>
      {isBorder && <div className={styles.border} />}
      <span className={styles.content}>{children}</span>
      {isBorder && <div className={styles.border} />}
    </div>
  );
}
