import Resource from "./utils/resource";
// import ChatKitty from "@chatkitty/core";
import ChatKitty from "chatkitty";
import { ChatKitty as ChatKittySdk } from "chatkitty-platform-sdk";
import { cloneDeep } from "lodash";
import CONSTANTS from "../helpers/constants";
import { serializeToQueryString } from "helpers/misc";


const MESSAGE_PAGE_SIZE = 50;

const MessageDraftType = {
  Text: "text",
  Giphy: "giphy",
};

/* This is mostly use for MVP version for ChatKitty
 * these information will be saved on the database when create a new tenant and update for old tenant
 * the sdk call will also be move to backend as new API for office chat
 */
export class KittyOfficeChat extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
    this.session = null;
    this.currentChatSession = null;
    this.dataNotification = null;
  }

  async init(data) {
    const { chat_kitty_key, chat_kitty_secret } = data;
    const clientId = chat_kitty_key;
    const clientSecret = chat_kitty_secret;
    const kitty = ChatKitty.getInstance(clientId);
    const kittySdk = new ChatKittySdk({
      clientId,
      clientSecret,
    });
    this.kitty = kitty;
    this.kittySdk = kittySdk;
  }

  async getChannel(channelId) {
    return await this.kitty.getChannel(channelId);
  }

  async startSession() {
    console.log("Start User Session");
    const user = this.store.authentication.user;

    const result = await this.kitty.startSession({
      username: user.email,
    });
    if (result.succeeded) {
      this.session = result.session;
    }

    return result;
  }

  async endSession() {
    console.log("End User Session");
    return await this.kitty.endSession();
  }

  async createMessageChannel(type, members) {
    if (!type) {
      return;
    }

    const result = await this.kitty.createChannel({
      type: type,
      members: members,
    });

    return result;
  }

  async createGroupChannel(type, name) {
    if (!type) {
      return;
    }
    const result = await this.kittySdk.Channels.createChannel({
      type,
      name,
    });
    return result;
  }

  async listChannelMembers(id, page = 0, size = 25) {
    const result = await this.kittySdk.Channels.listChannelMembers(
      id,
      page,
      size
    );
    return result;
  }

  async addGroupChannelMember(id, members) {
    const result = await this.kittySdk.Channels.addChannelMember(id, members);
    return result;
  }

  async deleteMemberWithGroupChannel(channelId, memberId) {
    const result = await this.kittySdk.Channels.removeChannelMember(
      channelId,
      memberId
    );
    return result;
  }

  async addGroupChannelModerator(id, moderators) {
    const result = await this.kittySdk.Channels.addChannelModerator(
      id,
      moderators
    );
    return result;
  }

  async getListModerators(id) {
    const result = await this.kittySdk.Channels.listChannelModerators(id);
    return result;
  }

  async getListMessageReadReceipts(id) {
    const result = await this.kittySdk.Messages.listMessageReadReceipts(id);
    return result;
  }

  async deleteChannel(channel) {
    const result = await this.kitty.deleteChannel({
      channel: channel,
    });
    console.log(result);
    if (result.succeeded) {
      // Handle result
    }
    // TODO handle delete action

    return result;
  }

  async hideChannel(channel) {
    const result = await this.kitty.hideChannel({
      channel: channel,
    });
    console.log(result);
    if (result.succeeded) {
      // Handle result
      console.log("hideChannel", result);
    }
    console.log("hideChannel bed", result);

    return result;
  }

  async getNextPage(paginator, results = []) {
    if (paginator?.hasNextPage) {
      const res = await paginator?.nextPage();
      return await this.getNextPage(res, [...results, ...res.items]);
    }
    return results;
  }
  async getAllPages(fn) {
    const { paginator } = await fn;
    const items = paginator?.items || [];
    return [...items, ...(await this.getNextPage(paginator))];
  }

  async getChannels(name = null) {
    const filter = {
      filter: {
        name,
      },
    };
    return this.getAllPages(this.kitty.getChannels(filter));
  }

  async getUnreadChannels(name = null) {
    const filter = {
      filter: {
        name,
        unread: true,
      },
    };
    return this.getAllPages(this.kitty.getChannels(filter));
  }

  async listChannels(page = 0, size = 25) {
    return await this.kittySdk.Channels.listChannels(page, size);
  }

  async updateDisplayNameChannelGroup(id, name, options) {
    return await this.kittySdk.Channels.updateChannel(id, {
      displayName: name,
      options: options,
    });
  }

  async updatePictureChannelGroup(id, channelPropertiesPatch) {
    return await this.kittySdk.Channels.updateChannel(id, {
      properties: channelPropertiesPatch,
    });
  }

  async hideGroup(id, user) {
    return this.changePropertiesGroup(id, user, "hide");
  }

  async unhideGroup(id, user) {
    return this.changePropertiesGroup(id, user, "unhide");
  }

  async pinChannel(id, user) {
    return this.changePropertiesGroup(id, user, "pin");
  }

  async unpinChannel(id, user) {
    return this.changePropertiesGroup(id, user, "unpin");
  }

  async changePropertiesGroup(id, newProperties, cause = "") {
    const result = await this.kitty.getChannel(id);
    const caseActionAddProperty = async (option) =>
      await this.kittySdk.Channels.updateChannel(id, {
        properties: {
          ...result.channel.properties,
          [option]: result.channel.properties?.[option]
            ? [...result.channel.properties[option], newProperties]
            : [newProperties],
        },
      });
    const caseActionFilterProperty = async (option) =>
      await this.kittySdk.Channels.updateChannel(id, {
        properties: {
          ...result.channel.properties,
          [option]: [...result.channel.properties[option]].filter(
            (user) => user !== newProperties
          ),
        },
      });
    switch (cause) {
      case "pin": {
        return await caseActionAddProperty("pinned");
      }
      case "unpin": {
        return await caseActionFilterProperty("pinned");
      }
      case "hide": {
        return await caseActionAddProperty("hideStatus");
      }
      case "unhide": {
        return await caseActionFilterProperty("hideStatus");
      }
      default: {
        const modified = await this.kittySdk.Channels.updateChannel(id, {
          properties: { ...result.channel.properties, ...newProperties },
        });
        return modified;
      }
    }
  }

  async groupImageUpload(file) {
    try {
      const filename = file.name;
      const filesize = file.size;
      const content_type = file.type;
      const category_name = "group_picture";
      const patient_id = 0;
      const did = "";
      const queryString = serializeToQueryString({
        filename,
        filesize,
        content_type,
        category_name,
        patient_id,
        did,
      });
      const response = await this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/upload${queryString}`
      ).then((res) => res.json());
      return response;
    } catch (err) {
      console.error(err);
      throw Error(err);
    }
  }

  async createChatSession({
    channel,
    onReceivedMessage,
    onMessageUpdated,
    onChannelUpdated,
    onMessageReactionAdded,
    onMessageReactionRemoved,
    onMessageRead,
  }) {
    if (!channel) {
      return;
    }
    const result = this.kitty.startChatSession({
      channel: channel,
      onReceivedMessage,
      onReceivedKeystrokes: (keystrokes) => {
        console.log("on received keystrokes");
        console.log(keystrokes);
      },
      onTypingStarted: (user) => {
        console.log("on typing started");
        console.log(user);
      },
      onTypingStopped: (user) => {
        console.log("on typing stopped");
        console.log(user);
      },
      onParticipantEnteredChat: (user) => {
        console.log("on participant entered chat");
        console.log(user);
      },
      onParticipantLeftChat: (user) => {
        console.log("on participant left chat");
        console.log(user);
      },
      onParticipantPresenceChanged: (user) => {
        console.log("on participant presence changed");
        console.log(user);
      },
      onMessageRead,
      onMessageUpdated,
      onChannelUpdated,
      onMessageReactionAdded,
      onMessageReactionRemoved,
    });

    if (result.succeeded) {
      this.currentChatSession = result.session;
    }

    return result;
  }

  async sendMessage(message, channel, replyMessage = null) {
    if (!channel) {
      return;
    }

    if (replyMessage) {
      return await this.kitty.sendMessage({
        body: message,
        message: replyMessage,
        properties: replyMessage,
      });
    }

    if (replyMessage) {
      return await this.kitty.sendMessage({
        body: message,
        message: replyMessage,
        properties: replyMessage,
      });
    }

    return await this.kitty.sendMessage({
      channel: channel,
      body: message,
    });
  }

  async sendFileMessage(file, channel) {
    if (!channel) {
      return;
    }

    return await this.kitty.sendMessage({
      channel: channel,
      file: file,
      progressListener: {
        onStarted: () => {
          // Handle file upload started
        },
        onProgress: (progress) => {
          // Handle file upload process
        },
        onCompleted: (result) => {
          // Handle file upload completed
        },
      },
    });
  }

  async getChannelHistoryMessage(channel, start) {
    if (!channel) {
      return;
    }
    return await this.kitty.getMessages({
      channel: channel,
      filter: {
        start: 0,
        size: MESSAGE_PAGE_SIZE,
        relation: "PREVIOUS",
      },
    });
  }

  async users() {
    return await this.kitty.getUsers();
  }

  async createUser(username, displayName) {
    try {
      return await this.kittySdk.Users.createUser({
        name: username,
        displayName,
        isGuest: true,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteUser(UserId) {
    try {
      await this.kittySdk.Users.deleteUser(UserId);
    } catch (error) {
      console.log(error);
    }
  }

  async isUserExisted(username) {
    try {
      return await this.kittySdk.Users.checkUserExists(username);
    } catch (error) {
      console.log(error);
    }
  }

  async getURLFile(fileURL) {
    try {
      const blobPromise = await fetch(fileURL).then((fileblob) =>
        fileblob.blob()
      );
      return blobPromise;
    } catch (error) {
      console.log(error);
    }
    return null;
  }

  async joinedChannelsPaginator() {
    return await this.kitty.getChannels({
      filter: { joined: true },
    });
  }

  async joinableChannelsPaginator() {
    return await this.kitty.getChannels({
      filter: { joined: false },
    });
  }

  async joinChannel(channel) {
    if (!channel) {
      return;
    }
    return await this.kitty.joinChannel({ channel });
  }

  async leaveChannel(channel) {
    if (!channel) {
      return;
    }
    return await this.kitty.leaveChannel({ channel });
  }

  onJoinedChannel(handler) {
    return this.kitty.onChannelJoined(handler);
  }

  onLeftChannel(handler) {
    return this.kitty.onChannelLeft(handler);
  }

  listerChange(notification) {
    return this.kitty.onNotificationReceived((data) => {
      this.dataNotification = data;
      notification(data);
    });
  }

  channelDisplayName(channel) {
    if (!channel) {
      return;
    }
    // if (isDirectChannel(channel)) {
    //   return channel.members
    //     .filter((member) => member.id !== this.user.id)
    //     .map((member) => member.displayName)
    //     .join(', ');
    // }

    return channel.name;
  }

  channelDisplayPicture(channel) {
    if (!channel) {
      return;
    }
    if (isDirectChannel(channel) && channel.members.length === 2) {
      return channel.members
        .filter((member) => member.id !== this.user.id)
        .map((member) => member.displayPictureUrl)[0];
    }

    return null;
  }

  async updateUserDisplayPicture(id, url, size) {
    try {
      await this.kittySdk.Users.updateUserDisplayPicture(id, {
        url: url,
        name: "user.png",
        contentType: "image/png",
        size: size,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async channelUnreadMessagesCount(channel) {
    return await this.kitty.getUnreadMessagesCount({
      channel,
    });
  }

  async messagesPaginator(channel) {
    const result = await this.kitty.getMessages({
      channel,
    });

    if (result.succeeded) {
      return result.paginator;
    }

    return null;
  }

  async readMessage(message) {
    return await this.kitty.readMessage({
      message,
    });
  }

  async sendThreadMessage(id, body) {
    return await this.kitty.Threads.sendThreadMessage(id, {
      type: "TEXT",
      body: body,
    });
  }

  async replyMessagesPaginator(message) {
    return await this.kitty.getMessages({
      message,
    });
  }

  async getMessageParent(message) {
    const test = message;
    if (test.nestedLevel > 0) {
      const result = await this.kitty.getMessageParent({
        message,
      });

      if (result.succeeded) {
        return result.message;
      }
    }
    return null;
  }

  async memberListGetter(channel) {
    const result = await this.kitty.getChannelMembers({ channel: channel });
    if (result.succeeded) {
      return result.paginator.items;
    }
    return null;
  }

  async reactToMessage(emoji, message) {
    return await this.kitty.reactToMessage({ emoji, message });
  }

  async removeReaction(emoji, message) {
    return await this.kitty.removeReaction({ emoji, message });
  }

  async updateMessageDraft(draft, channel) {
    if (!channel) {
      return;
    }
    return await this.kitty.sendKeystrokes({ channel, keys: draft.text });
  }

  async sendMessageDraft(draft, channel, userFile, replyMessage) {
    if (!channel) {
      return;
    }

    if (this.isTextMessageDraft(draft)) {
      if (userFile) {
        if (replyMessage) {
          await this.kitty.sendMessage({
            body: draft.text,
            message: replyMessage,
            file: userFile,
          });
        } else {
          await this.kitty.sendMessage({
            channel: channel,
            body: draft.text,
            file: userFile,
          });
        }
      } else {
        if (replyMessage) {
          await this.kitty.sendMessage({
            body: draft.text,
            message: replyMessage,
          });
        } else {
          await this.kitty.sendMessage({
            channel: channel,
            body: draft.text,
          });
        }
      }
    }
  }

  isTextMessageDraft(draft) {
    return draft.type === MessageDraftType.Text;
  }
}
