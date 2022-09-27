import Resource from './utils/resource';
import { flow } from 'mobx';
import moment from 'moment-timezone';
import { groupBy as _groupby } from 'lodash';
import CONSTANTS from '../helpers/constants';
import { serializeToQueryString } from '../helpers/misc';
// import { queryClient } from 'App';
var AsyncLock = require('async-lock');

let lockOfficeChats = new AsyncLock();

export class OfficeChat extends Resource {
  getSortedChats = (data, sortOrder = 'asc') => {
    if (sortOrder === 'asc') {
      // Returns chats in ascending order
      return data.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
    } else {
      // Returns chats in descending order
      return data.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
    }
  };

  async listApiHandler(params) {
    const response = await this.fetch(
      `${CONSTANTS.OFFICE_CHAT_API_URL}/office-chat${serializeToQueryString(
        params,
      )}`,
    ).then((r) => r.json());

    return this.getSortedChats(response.data, 'asc');
  }

  submitChat = flow(function* (message) {
    yield this._createChatApiHandler({ message });
    yield this.fetchList();
  });

  async _createChatApiHandler({ message, ref }) {
    return this.fetch(`${CONSTANTS.OFFICE_CHAT_API_URL}/office-chat`, {
      method: 'POST',
      body: JSON.stringify({ message, ui_ref: ref }),
    }).then((response) => response.json());
  }

  formattedMessages = (data, showDate) => {
    const { timezone, user_id } = this.authentication.user || {};
    let chatsToProcess = data;
    let dateCounter = moment
      .utc(chatsToProcess[0].created_at)
      .tz(timezone)
      .startOf('day');
    let formattedChat = [];
    let combinationId = 0;
    chatsToProcess.forEach((chat, index) => {
      // const chat = this.get([null, chatId]);

      const previousChat = chatsToProcess[index - 1];
      if (!chat) return;
      if (index === 0) {
        if (showDate) {
          formattedChat.push({
            type: 'DATE',
            date: moment.utc(chat.created_at).tz(timezone),
            combinationId,
          });
          combinationId += 1;
        }
        return formattedChat.push({
          type: 'CHAT',
          ...chat,
          combinationId,
          datetime: moment.utc(chat.created_at).tz(timezone),
          text: chat.message,
          direction: chat.from_user === user_id ? 'OUT' : 'IN',
          media: [],
        });
      }

      if (
        !moment
          .utc(chat.created_at)
          .tz(timezone)
          .startOf('day')
          .isSame(dateCounter)
      ) {
        combinationId = combinationId + 1;
        formattedChat.push({
          type: 'DATE',
          date: moment.utc(chat.created_at).tz(timezone),
          combinationId,
        });
        combinationId = combinationId + 1;
        dateCounter = moment.utc(chat.created_at).tz(timezone).startOf('day');
      }

      if (
        moment
          .utc(chat.created_at)
          .tz(timezone)
          .diff(previousChat.created_at, 'minutes') > 1 ||
        previousChat.direction !== chat.direction ||
        previousChat.from_user !== chat.from_user
      ) {
        combinationId = combinationId + 1;
      }
      formattedChat.push({
        type: 'CHAT',
        ...chat,
        datetime: moment.utc(chat.created_at).tz(timezone),
        text: chat.message,
        media: [],
        combinationId,
        direction: chat.from_user === user_id ? 'OUT' : 'IN',
      });
    });
    var res = Object.values(_groupby(formattedChat, 'combinationId'));
    return res;
  };

  appendMessageOrDiscard(message) {
    lockOfficeChats.acquire(
      'office-chats',
      function (done) {
        // queryClient.setQueryData('office-chats', (old) => {
        //   if (old.pages && old.pages.length > 0) {
        //     let lastPage = old.pages[old.pages.length - 1];

        //     // replace old if exists
        //     if (lastPage.some((m) => m.id === message.ui_ref)) {
        //       lastPage = lastPage.map((m) =>
        //         m.id === message.ui_ref ? message : m,
        //       );
        //     } else if (!lastPage.some((m) => m.id === message.id)) {
        //       lastPage = [...lastPage, message];
        //     }

        //     old.pages[old.pages.length - 1] = lastPage;
        //   }
        //   return old;
        // });
        done();
      },
      function (err, ret) {},
      {},
    );
  }

  async getRapidReplies() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/rapid-replies`,
        {
          method: 'GET',
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch Rapid Replies',
        );
      }
      return response.data;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch Rapid Replies',
      );
    }
  }

  async createRapidReplay(data) {
    try {
      let response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/rapid-replies`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      this.notification.showSuccess('Rapid Replies saved successfully.');
      return await response.json();
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to post Rapid Replies',
      );
    }
  }

  async editRapidReplay(data) {
    try {
      let response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/rapid-replies`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
      );
      this.notification.showSuccess('Rapid Replies saved successfully.');
      return await response.json();
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to post Rapid Replies',
      );
    }
  }

  async reorderRapidReplay(data) {
    try {
      let response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/rapid-replies/${data.id}/reorder/${data.order}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
      );
      this.notification.showSuccess('Rapid Replies reorder successfully.');
      return await response.json();
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to reorder Rapid Replies',
      );
    }
  }

  async deleteRapidReplay(data) {
    try {
      let queryString = data;
      let response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/rapid-replies/${queryString}`,
        {
          method: 'DELETE',
        },
      );
      this.notification.showSuccess('Rapid Replies deleted successfully.');
      return response;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to delete Rapid Replies',
      );
    }
  }
}
