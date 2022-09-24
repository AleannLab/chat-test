import React, { useState, useEffect } from 'react';

const useLocalStorage = (initialValue, key) => {
  const getValue = () => {
    const storage = localStorage.getItem(key);
    if (storage) {
      return JSON.parse(storage);
    }
    return initialValue;
  };
  const [valueLocalStorage, setValueLocalStorage] = useState(getValue);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(valueLocalStorage));
  }, [valueLocalStorage]);
  return [valueLocalStorage, setValueLocalStorage];
};

export { useLocalStorage };
