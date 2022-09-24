const conditionalFilter = (key, channels = [], email) => {
  return channels.filter((channel) => {
    const { hideStatus, pinned } = channel?.properties || {};
    switch (key) {
      case 'regular':
        return !hideStatus?.includes(email) && !pinned?.includes(email);
      case 'archive':
        return hideStatus?.includes(email) && !pinned?.includes(email);
      case 'pinned':
        return !hideStatus?.includes(email) && pinned?.includes(email);
    }
  });
};

export { conditionalFilter };
