const setQuantityUnreadMessages = async (
  channel,
  kittyOfficeChat,
  setCountUnreadChannel,
) => {
  const { id } = channel;
  const result = await kittyOfficeChat.channelUnreadMessagesCount(channel);

  setCountUnreadChannel(id, result.count);
};

export { setQuantityUnreadMessages };
