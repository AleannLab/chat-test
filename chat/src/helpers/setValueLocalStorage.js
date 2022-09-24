const setValueLocalStorage = (key, value) => {
  return localStorage.setItem(key, JSON.stringify(value));
};

export { setValueLocalStorage };
