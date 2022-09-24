import {
  SET_UNREAD_COUNT_MESSAGE,
  INCREASE_UNREAD_COUNT_MESSAGE,
  RESET_UNREAD_COUNT_MESSAGE,
  TOGGLE_BUBBLE_CHAT,
  SET_CHANNELS,
} from './officeChatActions';

const officeChatReducer = (state, action) => {
  const { type, payload } = action;
  const newCountUnreadMessageChannels = {
    ...state.countUnreadMessageChannels,
  };
  switch (type) {
    case SET_UNREAD_COUNT_MESSAGE: {
      const { count, idChannel } = payload;
      newCountUnreadMessageChannels[idChannel] = count;
      return {
        ...state,
        countUnreadMessageChannels: newCountUnreadMessageChannels,
      };
    }
    case INCREASE_UNREAD_COUNT_MESSAGE: {
      newCountUnreadMessageChannels[payload] =
        (newCountUnreadMessageChannels[payload] || 0) + 1;
      return {
        ...state,
        countUnreadMessageChannels: newCountUnreadMessageChannels,
      };
    }
    case RESET_UNREAD_COUNT_MESSAGE: {
      const RESET_UNREAD_MESSAGE = 0;
      newCountUnreadMessageChannels[payload] = RESET_UNREAD_MESSAGE;
      return {
        ...state,
        countUnreadMessageChannels: newCountUnreadMessageChannels,
      };
    }
    case TOGGLE_BUBBLE_CHAT: {
      return {
        ...state,
        isActiveBubbleChat: payload,
      };
    }
    case SET_CHANNELS: {
      return {
        ...state,
        channels: payload,
      };
    }
    default:
      return state;
  }
};

export { officeChatReducer };
