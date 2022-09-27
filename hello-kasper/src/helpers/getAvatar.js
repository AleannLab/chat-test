const getAvatar = (channel, user, users, authToken, utils) => {
  const { members, properties } = channel;
  const otherMember = members?.find((member) => member.name !== user.email);
  const userUuid = users.find((x) => x.email === otherMember?.name);
  const displayImage = properties?.uuid
    ? properties?.uuid
    : userUuid?.display_image;
  const user_id = userUuid?.user_id;
  const imgUrl = userUuid
    ? utils.prepareMediaUrl({ uuid: userUuid?.display_image, authToken })
    : displayImage
    ? utils.prepareMediaUrl({ uuid: displayImage, authToken })
    : '';
  return { imgUrl, user_id };
};
export { getAvatar };
