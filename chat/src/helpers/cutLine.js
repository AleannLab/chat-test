const cutLine = (string, n) => {
  if (string) {
    return string.length > n ? string.substr(0, n - 1) + '...' : string;
  } else {
    return '';
  }
};

export { cutLine };
