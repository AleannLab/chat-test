import React from 'react';
import style from './style.module.css';

export default function UnseenCounter({ count }) {
  if (!count || count <= 0) return null;

  return <div className={style.counter}>{count > 9 ? '9+' : count}</div>;
}
