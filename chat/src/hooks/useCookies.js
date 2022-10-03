import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const useCookies = (initialValue, cookieName) => {
  const getValue = () => {
    const cookie = Cookies.get(cookieName);
    if (cookie) {
      return JSON.parse(cookie);
    }
    return initialValue;
  };
  const [valueCookie, setValueCookie] = useState(getValue);

  useEffect(() => {
    Cookies.set(cookieName, JSON.stringify(valueCookie), {
      expires: 1, //1 day
    });
  }, [valueCookie]);
  return [valueCookie, setValueCookie];
};

export { useCookies };
