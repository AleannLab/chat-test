const getValueLocalStorage = (key) => {
  const storage = localStorage.getItem(key);
  return JSON.parse(storage);
};

export { getValueLocalStorage };
