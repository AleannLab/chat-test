const getUserIds = (members, users) => {
  return users
    .filter((user) => members.some((m) => m.name === user.email))
    .map(({ id }) => id);
};

export { getUserIds };
