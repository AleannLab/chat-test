import React, { useReducer, createContext } from 'react';
import { officeChatReducer } from './officeChatReducer';
import { getValueLocalStorage } from 'helpers/getValueLocalStorage';
import { setValueLocalStorage } from 'helpers/setValueLocalStorage';
import { conditionalFilter } from 'helpers/conditionalFilter';
import {
  SET_UNREAD_COUNT_MESSAGE,
  INCREASE_UNREAD_COUNT_MESSAGE,
  RESET_UNREAD_COUNT_MESSAGE,
  TOGGLE_BUBBLE_CHAT,
  SET_CHANNELS,
} from './officeChatActions';

export const OfficeChatContext = createContext();
export const OfficeChatDispatch = createContext();

const initialState = {
  countUnreadMessageChannels: {},
  isActiveBubbleChat: getValueLocalStorage('isActiveBubble'),
  channels: {
    allChannels: [],
    regular: [],
    archive: [],
    pinned: [],
  },
};

const OfficeChatContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(officeChatReducer, initialState);

  const setCountUnreadChannel = (idChannel, count) => {
    dispatch({
      type: SET_UNREAD_COUNT_MESSAGE,
      payload: { idChannel, count },
    });
  };

  const setIncreaseUnreadCountMessage = (idChannel) => {
    dispatch({
      type: INCREASE_UNREAD_COUNT_MESSAGE,
      payload: idChannel,
    });
  };

  const setResetUnreadCountMessage = (idChannel) => {
    dispatch({
      type: RESET_UNREAD_COUNT_MESSAGE,
      payload: idChannel,
    });
  };

  const toggleBubbleChat = (isActive) => {
    setValueLocalStorage('isActiveBubble', isActive);
    dispatch({
      type: TOGGLE_BUBBLE_CHAT,
      payload: isActive,
    });
  };

  const setChannels = (channels, email) => {
    const regular = conditionalFilter('regular', channels, email);
    const archive = conditionalFilter('archive', channels, email);
    const pinned = conditionalFilter('pinned', channels, email);

    dispatch({
      type: SET_CHANNELS,
      payload: {
        allChannels: channels,
        regular: [...pinned, ...regular],
        archive,
        pinned,
      },
    });
  };

  return (
    <OfficeChatContext.Provider value={state}>
      <OfficeChatDispatch.Provider
        value={{
          setCountUnreadChannel,
          setIncreaseUnreadCountMessage,
          setResetUnreadCountMessage,
          toggleBubbleChat,
          setChannels,
        }}
      >
        {children}
      </OfficeChatDispatch.Provider>
    </OfficeChatContext.Provider>
  );
};

export { OfficeChatContextProvider };
