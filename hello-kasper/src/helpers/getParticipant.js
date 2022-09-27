const getParticipant = (channel, user) => {
  return channel.members.find(({ name }) => name !== user.email);
};

export { getParticipant };
