import axios from 'axios';

const getGroupNewAvatar = async (
  file,
  kittyOfficeChat,
  groupId,
  utils,
  authToken,
  notification,
) => {
  try {
    const response = await kittyOfficeChat.groupImageUpload(file);
    if (response.url) {
      await axios({
        method: 'PUT',
        url: response.url,
        headers: {
          'content-type': file.type,
        },
        processData: false,
        data: file,
      });
      const userImg = utils.prepareMediaUrl({
        uuid: response.uuid,
        authToken,
      });
      notification.showSuccess('Profile picture was updated successfully');
      setTimeout(() => {
        notification.hideNotification();
      }, 2500);
      if (response.uuid) {
        await kittyOfficeChat.updatePictureChannelGroup(groupId, {
          uuid: response.uuid,
        });
      }
      return userImg;
    }
  } catch (e) {
    notification.showError(
      'An unexpected error occurred while attempting to upload the profile picture',
    );
  }
};

export { getGroupNewAvatar };
